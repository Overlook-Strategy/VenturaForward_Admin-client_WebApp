import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { findOrganizationByMetaTags, upsertMetaPost } from '@/libs/AgencyData';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

export const runtime = 'nodejs';

type MetaWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: Record<string, unknown>;
    }>;
    id?: string;
    time?: number;
  }>;
  object?: string;
};

const verifyMetaSignature = (rawBody: string, signatureHeader: string | null) => {
  if (!Env.META_APP_SECRET) {
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', Env.META_APP_SECRET)
    .update(rawBody)
    .digest('hex');

  const provided = signatureHeader.replace(/^sha256=/, '');

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

const parseTimestamp = (value?: unknown, fallback?: number) => {
  if (typeof value === 'number') {
    return new Date(value * 1000);
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  if (typeof fallback === 'number') {
    return new Date(fallback * 1000);
  }

  return new Date();
};

const parseNumber = (value?: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const extractTags = (value: Record<string, unknown>) => {
  const tags = new Set<string>();

  const arraysToScan = [
    value.tagged_users,
    value.mentions,
    value.tags,
  ] as unknown[];

  for (const candidate of arraysToScan) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    for (const item of candidate) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const username = (item as Record<string, unknown>).username;
      if (typeof username === 'string' && username.trim()) {
        tags.add(username);
      }
    }
  }

  if (typeof value.caption === 'string') {
    const matches = value.caption.match(/@([a-zA-Z0-9._]+)/g) ?? [];
    for (const match of matches) {
      tags.add(match.slice(1));
    }
  }

  return [...tags];
};

const parseMetaChange = (entryId: string, entryTime: number, change: { field?: string; value?: Record<string, unknown> }) => {
  const value = change.value ?? {};

  const sourceEventId = [
    entryId,
    change.field ?? 'unknown',
    String(value.id ?? value.media_id ?? value.post_id ?? value.permalink ?? entryTime),
  ].join(':');

  const postIdSource = value.media_id ?? value.post_id ?? value.id ?? sourceEventId;
  const postId = String(postIdSource);

  const postUrl = String(value.permalink ?? value.post_url ?? value.media_url ?? '');

  const likeCount = parseNumber(value.like_count ?? value.likes_count);
  const commentCount = parseNumber(value.comment_count ?? value.comments_count);
  const impressionCount = parseNumber(value.impressions ?? value.impression_count);
  const engagementCount = parseNumber(value.engagement_count ?? likeCount + commentCount);
  const postedAt = parseTimestamp(value.timestamp, entryTime);

  return {
    caption: typeof value.caption === 'string' ? value.caption : null,
    commentCount,
    engagementCount,
    likeCount,
    postId,
    postUrl,
    postedAt,
    rawPayload: value,
    sourceEventId,
    tags: extractTags(value),
    valid: Boolean(postUrl),
    impressionCount,
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  if (
    mode === 'subscribe'
    && challenge
    && verifyToken
    && verifyToken === Env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: MetaWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const entries = payload.entry ?? [];
  let ingested = 0;
  let skipped = 0;

  for (const entry of entries) {
    const changes = entry.changes ?? [];

    for (const change of changes) {
      const parsed = parseMetaChange(entry.id ?? 'unknown-entry', entry.time ?? Date.now() / 1000, change);

      if (!parsed.valid || !parsed.tags.length) {
        skipped += 1;
        continue;
      }

      const organization = await findOrganizationByMetaTags(parsed.tags);

      if (!organization) {
        skipped += 1;
        continue;
      }

      await upsertMetaPost({
        caption: parsed.caption,
        commentCount: parsed.commentCount,
        engagementCount: parsed.engagementCount,
        id: parsed.postId,
        impressionCount: parsed.impressionCount,
        likeCount: parsed.likeCount,
        organizationId: organization.id,
        postUrl: parsed.postUrl,
        postedAt: parsed.postedAt,
        rawPayload: parsed.rawPayload,
        sourceEventId: parsed.sourceEventId,
      });

      ingested += 1;
    }
  }

  logger.info({ ingested, skipped }, 'Meta webhook processed');

  return NextResponse.json({ ingested, skipped, success: true });
}
