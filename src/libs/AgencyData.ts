import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
  sql,
} from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  clientProfileSchema,
  metaPostSchema,
  monthlySummarySchema,
  organizationSchema,
  paymentSchema,
} from '@/models/Schema';

const PAYMENT_STATUS = {
  OVERDUE: 'OVERDUE',
  PAID: 'PAID',
  PENDING: 'PENDING',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const normalizePaymentStatus = (status: string): PaymentStatus => {
  const value = status.toLowerCase();

  if (value.includes('paid') || value === 'succeeded') {
    return PAYMENT_STATUS.PAID;
  }

  if (value.includes('overdue') || value.includes('uncollectible')) {
    return PAYMENT_STATUS.OVERDUE;
  }

  return PAYMENT_STATUS.PENDING;
};

export const getPreviousMonthRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));

  return {
    end,
    month: start.getUTCMonth() + 1,
    start,
    year: start.getUTCFullYear(),
  };
};

export const getUtcRangeForMonth = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return { end, start };
};

export const getOrganizationById = async (organizationId: string) => {
  const [organization] = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.id, organizationId))
    .limit(1);

  return organization ?? null;
};

export const ensureOrganization = async (
  organizationId: string,
  displayName?: string,
) => {
  const existing = await getOrganizationById(organizationId);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(organizationSchema)
    .values({
      displayName: displayName ?? organizationId,
      id: organizationId,
    })
    .returning();

  return created;
};

export const getOrganizationByStripeCustomerId = async (stripeCustomerId: string) => {
  const [organization] = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return organization ?? null;
};

export const findOrganizationByMetaTags = async (rawTags: string[]) => {
  const tags = rawTags
    .map(tag => tag.trim().replace(/^@/, '').toLowerCase())
    .filter(Boolean);

  if (!tags.length) {
    return null;
  }

  const [organization] = await db
    .select()
    .from(organizationSchema)
    .where(
      and(
        eq(organizationSchema.isActive, true),
        inArray(sql`lower(${organizationSchema.metaBrandTag})`, tags),
      ),
    )
    .limit(1);

  return organization ?? null;
};

export const upsertMetaPost = async (input: {
  caption?: string | null;
  commentCount: number;
  engagementCount: number;
  id: string;
  impressionCount: number;
  likeCount: number;
  organizationId: string;
  postUrl: string;
  postedAt: Date;
  rawPayload: Record<string, unknown>;
  sourceEventId?: string;
}) => {
  const [post] = await db
    .insert(metaPostSchema)
    .values({
      caption: input.caption ?? null,
      commentCount: input.commentCount,
      engagementCount: input.engagementCount,
      id: input.id,
      impressionCount: input.impressionCount,
      likeCount: input.likeCount,
      organizationId: input.organizationId,
      postUrl: input.postUrl,
      postedAt: input.postedAt,
      rawPayload: input.rawPayload,
      sourceEventId: input.sourceEventId ?? null,
    })
    .onConflictDoUpdate({
      set: {
        caption: input.caption ?? null,
        commentCount: input.commentCount,
        engagementCount: input.engagementCount,
        impressionCount: input.impressionCount,
        likeCount: input.likeCount,
        postUrl: input.postUrl,
        postedAt: input.postedAt,
        rawPayload: input.rawPayload,
        sourceEventId: input.sourceEventId ?? null,
        updatedAt: new Date(),
      },
      target: metaPostSchema.id,
    })
    .returning();

  return post;
};

export const upsertPayment = async (input: {
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate: Date | null;
  id: string;
  organizationId: string;
  paidAt: Date | null;
  periodEnd: Date | null;
  periodStart: Date | null;
  rawPayload: Record<string, unknown>;
  status: PaymentStatus;
  stripeCustomerId: string | null;
  stripeInvoiceId: string | null;
}) => {
  const [payment] = await db
    .insert(paymentSchema)
    .values({
      amountDue: input.amountDue,
      amountPaid: input.amountPaid,
      currency: input.currency,
      dueDate: input.dueDate,
      id: input.id,
      organizationId: input.organizationId,
      paidAt: input.paidAt,
      periodEnd: input.periodEnd,
      periodStart: input.periodStart,
      rawPayload: input.rawPayload,
      status: input.status,
      stripeCustomerId: input.stripeCustomerId,
      stripeInvoiceId: input.stripeInvoiceId,
    })
    .onConflictDoUpdate({
      set: {
        amountDue: input.amountDue,
        amountPaid: input.amountPaid,
        currency: input.currency,
        dueDate: input.dueDate,
        paidAt: input.paidAt,
        periodEnd: input.periodEnd,
        periodStart: input.periodStart,
        rawPayload: input.rawPayload,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId,
        stripeInvoiceId: input.stripeInvoiceId,
        updatedAt: new Date(),
      },
      target: paymentSchema.id,
    })
    .returning();

  return payment;
};

export const getClientDashboardData = async (organizationId: string) => {
  const organization = await ensureOrganization(organizationId);

  const [clientProfile] = await db
    .select()
    .from(clientProfileSchema)
    .where(eq(clientProfileSchema.organizationId, organizationId))
    .limit(1);

  const posts = await db
    .select()
    .from(metaPostSchema)
    .where(eq(metaPostSchema.organizationId, organizationId))
    .orderBy(desc(metaPostSchema.postedAt))
    .limit(20);

  const payments = await db
    .select()
    .from(paymentSchema)
    .where(eq(paymentSchema.organizationId, organizationId))
    .orderBy(desc(paymentSchema.createdAt))
    .limit(10);

  return {
    clientProfile: clientProfile ?? null,
    organization,
    payments,
    posts,
  };
};

export const getAdminDashboardData = async () => {
  const organizations = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.isActive, true))
    .orderBy(organizationSchema.displayName);

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));

  const rows = await Promise.all(
    organizations.map(async organization => {
      const [postAgg] = await db
        .select({
          fulfilledCount: count(metaPostSchema.id),
        })
        .from(metaPostSchema)
        .where(
          and(
            eq(metaPostSchema.organizationId, organization.id),
            gte(metaPostSchema.postedAt, startOfMonth),
          ),
        );

      const [paymentAgg] = await db
        .select({
          overdueCount: count(paymentSchema.id),
        })
        .from(paymentSchema)
        .where(
          and(
            eq(paymentSchema.organizationId, organization.id),
            eq(paymentSchema.status, PAYMENT_STATUS.OVERDUE),
          ),
        );

      const [lastPayment] = await db
        .select()
        .from(paymentSchema)
        .where(eq(paymentSchema.organizationId, organization.id))
        .orderBy(desc(paymentSchema.updatedAt))
        .limit(1);

      return {
        currentMonthPosts: Number(postAgg?.fulfilledCount ?? 0),
        lastPaymentStatus: lastPayment?.status ?? PAYMENT_STATUS.PENDING,
        monthlyAdQuota: organization.monthlyAdQuota,
        organizationId: organization.id,
        organizationName: organization.displayName,
        overdueInvoices: Number(paymentAgg?.overdueCount ?? 0),
      };
    }),
  );

  return rows;
};

export const getMonthlyDigestData = async (year: number, month: number) => {
  const { end, start } = getUtcRangeForMonth(year, month);

  const organizations = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.isActive, true));

  const digests = await Promise.all(
    organizations.map(async organization => {
      const [postAgg] = await db
        .select({
          avgEngagement: sql<number>`COALESCE(AVG(${metaPostSchema.engagementCount}), 0)`,
          postCount: count(metaPostSchema.id),
        })
        .from(metaPostSchema)
        .where(
          and(
            eq(metaPostSchema.organizationId, organization.id),
            gte(metaPostSchema.postedAt, start),
            lte(metaPostSchema.postedAt, end),
          ),
        );

      const paymentRows = await db
        .select()
        .from(paymentSchema)
        .where(
          and(
            eq(paymentSchema.organizationId, organization.id),
            or(
              and(
                gte(paymentSchema.periodStart, start),
                lte(paymentSchema.periodStart, end),
              ),
              and(
                gte(paymentSchema.periodEnd, start),
                lte(paymentSchema.periodEnd, end),
              ),
            ),
          ),
        )
        .orderBy(desc(paymentSchema.updatedAt));

      const postCount = Number(postAgg?.postCount ?? 0);
      const quotaTarget = organization.monthlyAdQuota;
      const quotaFulfilled = postCount >= quotaTarget;

      const paidCount = paymentRows.filter(row => row.status === PAYMENT_STATUS.PAID).length;
      const pendingCount = paymentRows.filter(row => row.status === PAYMENT_STATUS.PENDING).length;
      const overdueCount = paymentRows.filter(row => row.status === PAYMENT_STATUS.OVERDUE).length;

      return {
        avgEngagement: Number(postAgg?.avgEngagement ?? 0),
        month,
        organization,
        overdueCount,
        paidCount,
        paymentRows,
        pendingCount,
        postCount,
        quotaFulfilled,
        quotaTarget,
        year,
      };
    }),
  );

  return digests;
};

export const upsertMonthlySummary = async (input: {
  month: number;
  organizationId: string;
  paymentStatusSummary: string;
  postCount: number;
  quotaFulfilled: boolean;
  quotaTarget: number;
  sentAt: Date;
  sentToEmail: string | null;
  year: number;
}) => {
  const [summary] = await db
    .insert(monthlySummarySchema)
    .values({
      month: input.month,
      organizationId: input.organizationId,
      paymentStatusSummary: input.paymentStatusSummary,
      postCount: input.postCount,
      quotaFulfilled: input.quotaFulfilled,
      quotaTarget: input.quotaTarget,
      sentAt: input.sentAt,
      sentToEmail: input.sentToEmail,
      year: input.year,
    })
    .onConflictDoUpdate({
      set: {
        paymentStatusSummary: input.paymentStatusSummary,
        postCount: input.postCount,
        quotaFulfilled: input.quotaFulfilled,
        quotaTarget: input.quotaTarget,
        sentAt: input.sentAt,
        sentToEmail: input.sentToEmail,
      },
      target: [
        monthlySummarySchema.organizationId,
        monthlySummarySchema.year,
        monthlySummarySchema.month,
      ],
    })
    .returning();

  return summary;
};
