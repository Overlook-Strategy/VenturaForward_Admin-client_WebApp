import { NextResponse } from 'next/server';

import {
  getMonthlyDigestData,
  getPreviousMonthRange,
  upsertMonthlySummary,
} from '@/libs/AgencyData';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { buildMonthlySummaryEmailHtml } from '@/templates/MonthlySummaryEmail';

export const runtime = 'nodejs';

type ResendResponse = {
  error?: {
    message?: string;
  };
  id?: string;
};

const parseBearerToken = (headerValue: string | null) => {
  if (!headerValue?.startsWith('Bearer ')) {
    return null;
  }

  return headerValue.slice('Bearer '.length).trim();
};

const sendMonthlyEmail = async (input: {
  avgEngagement: number;
  brandName: string;
  month: number;
  overdueCount: number;
  paidCount: number;
  pendingCount: number;
  postCount: number;
  quotaFulfilled: boolean;
  quotaTarget: number;
  recipient: string;
  year: number;
}) => {
  if (!Env.RESEND_API_KEY || !Env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL must be configured');
  }

  const html = buildMonthlySummaryEmailHtml({
    avgEngagement: input.avgEngagement,
    brandName: input.brandName,
    month: input.month,
    overdueCount: input.overdueCount,
    paidCount: input.paidCount,
    pendingCount: input.pendingCount,
    postCount: input.postCount,
    quotaFulfilled: input.quotaFulfilled,
    quotaTarget: input.quotaTarget,
    year: input.year,
  });

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: Env.RESEND_FROM_EMAIL,
      html,
      subject: `${input.brandName} - Monthly Ventura Forward Report`,
      to: [input.recipient],
    }),
    headers: {
      Authorization: `Bearer ${Env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const payload = await response.json() as ResendResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Failed to send monthly summary email');
  }

  return payload.id ?? null;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = parseBearerToken(authHeader);

  if (Env.CRON_SECRET && token !== Env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { month, year } = getPreviousMonthRange();
  const digests = await getMonthlyDigestData(year, month);

  let sent = 0;
  let skipped = 0;

  for (const digest of digests) {
    const recipient = digest.organization.billingEmail;

    const paymentSummary = `paid=${digest.paidCount},pending=${digest.pendingCount},overdue=${digest.overdueCount}`;

    if (!recipient) {
      await upsertMonthlySummary({
        month,
        organizationId: digest.organization.id,
        paymentStatusSummary: paymentSummary,
        postCount: digest.postCount,
        quotaFulfilled: digest.quotaFulfilled,
        quotaTarget: digest.quotaTarget,
        sentAt: new Date(),
        sentToEmail: null,
        year,
      });

      skipped += 1;
      continue;
    }

    try {
      await sendMonthlyEmail({
        avgEngagement: digest.avgEngagement,
        brandName: digest.organization.displayName,
        month,
        overdueCount: digest.overdueCount,
        paidCount: digest.paidCount,
        pendingCount: digest.pendingCount,
        postCount: digest.postCount,
        quotaFulfilled: digest.quotaFulfilled,
        quotaTarget: digest.quotaTarget,
        recipient,
        year,
      });

      await upsertMonthlySummary({
        month,
        organizationId: digest.organization.id,
        paymentStatusSummary: paymentSummary,
        postCount: digest.postCount,
        quotaFulfilled: digest.quotaFulfilled,
        quotaTarget: digest.quotaTarget,
        sentAt: new Date(),
        sentToEmail: recipient,
        year,
      });

      sent += 1;
    } catch (error) {
      logger.error(
        {
          error,
          organizationId: digest.organization.id,
          recipient,
        },
        'Failed to send monthly summary email',
      );

      skipped += 1;
    }
  }

  return NextResponse.json({
    month,
    sent,
    skipped,
    success: true,
    year,
  });
}
