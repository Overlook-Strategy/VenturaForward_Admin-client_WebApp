import {
  boolean,
  bigint,
  integer,
  pgEnum,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Need a database for production? Check out https://www.prisma.io/?via=saasboilerplatesrc
// Tested and compatible with Next.js Boilerplate
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    displayName: text('display_name').notNull(),
    billingEmail: text('billing_email'),
    metaBrandTag: text('meta_brand_tag'),
    monthlyAdQuota: integer('monthly_ad_quota').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
      metaBrandTagIdx: uniqueIndex('meta_brand_tag_idx').on(table.metaBrandTag),
    };
  },
);

export const organizationUserSchema = pgTable(
  'organization_user',
  {
    id: serial('id').primaryKey(),
    organizationId: text('organization_id')
      .references(() => organizationSchema.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id').notNull(),
    role: text('role').notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    organizationMemberIdx: uniqueIndex('organization_member_idx').on(
      table.organizationId,
      table.userId,
    ),
  }),
);

export const metaPostSchema = pgTable(
  'meta_post',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .references(() => organizationSchema.id, { onDelete: 'cascade' })
      .notNull(),
    sourceEventId: text('source_event_id'),
    postUrl: text('post_url').notNull(),
    caption: text('caption'),
    postedAt: timestamp('posted_at', { mode: 'date' }).notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    commentCount: integer('comment_count').default(0).notNull(),
    impressionCount: integer('impression_count').default(0).notNull(),
    engagementCount: integer('engagement_count').default(0).notNull(),
    rawPayload: jsonb('raw_payload').$type<Record<string, unknown>>(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    sourceEventIdx: uniqueIndex('meta_post_source_event_idx').on(table.sourceEventId),
  }),
);

export const paymentSchema = pgTable(
  'payment',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .references(() => organizationSchema.id, { onDelete: 'cascade' })
      .notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeInvoiceId: text('stripe_invoice_id'),
    amountDue: integer('amount_due').default(0).notNull(),
    amountPaid: integer('amount_paid').default(0).notNull(),
    currency: text('currency').default('usd').notNull(),
    status: text('status').notNull(),
    dueDate: timestamp('due_date', { mode: 'date' }),
    paidAt: timestamp('paid_at', { mode: 'date' }),
    periodStart: timestamp('period_start', { mode: 'date' }),
    periodEnd: timestamp('period_end', { mode: 'date' }),
    rawPayload: jsonb('raw_payload').$type<Record<string, unknown>>(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    stripeInvoiceIdIdx: uniqueIndex('payment_stripe_invoice_id_idx').on(
      table.stripeInvoiceId,
    ),
  }),
);

export const monthlySummarySchema = pgTable(
  'monthly_summary',
  {
    id: serial('id').primaryKey(),
    organizationId: text('organization_id')
      .references(() => organizationSchema.id, { onDelete: 'cascade' })
      .notNull(),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    postCount: integer('post_count').notNull(),
    quotaTarget: integer('quota_target').notNull(),
    quotaFulfilled: boolean('quota_fulfilled').default(false).notNull(),
    paymentStatusSummary: text('payment_status_summary').notNull(),
    sentToEmail: text('sent_to_email'),
    sentAt: timestamp('sent_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    monthlySummaryUnique: uniqueIndex('monthly_summary_unique_idx').on(
      table.organizationId,
      table.year,
      table.month,
    ),
  }),
);

export const partnershipPackageEnum = pgEnum('partnership_package', [
  'SHARING',
  'SOCIALIZING',
  'INFLUENCING',
]);

export const socialSupportOptionEnum = pgEnum('social_support_option', [
  'CONTENT_PRODUCTION',
  'EVENT_GRAPHICS_FLYERS',
  'SOCIAL_MEDIA_TRAINING',
  'FULL_MEDIA_MANAGEMENT',
]);

export const clientProfileSchema = pgTable(
  'client_profile',
  {
    id: serial('id').primaryKey(),
    organizationId: text('organization_id')
      .references(() => organizationSchema.id, { onDelete: 'cascade' })
      .notNull(),
    businessName: text('business_name').notNull(),
    mainPointOfContact: text('main_point_of_contact').notNull(),
    instagramHandle: text('instagram_handle').notNull(),
    partnershipPackage: partnershipPackageEnum('partnership_package').notNull(),
    additionalSupport: socialSupportOptionEnum('additional_support').array().notNull(),
    goals: text('goals').notNull(),
    completedAt: timestamp('completed_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    clientProfileOrganizationUnique: uniqueIndex('client_profile_organization_id_idx').on(
      table.organizationId,
    ),
  }),
);

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
