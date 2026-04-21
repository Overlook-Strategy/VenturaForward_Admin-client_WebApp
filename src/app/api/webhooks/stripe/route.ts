import Stripe from 'stripe';

import { NextResponse } from 'next/server';

import {
  getOrganizationById,
  getOrganizationByStripeCustomerId,
  normalizePaymentStatus,
  upsertPayment,
} from '@/libs/AgencyData';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

export const runtime = 'nodejs';

const stripe = new Stripe(Env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

const toDate = (unixTime: number | null | undefined) => {
  if (!unixTime) {
    return null;
  }

  return new Date(unixTime * 1000);
};

const getInvoiceStatus = (invoice: Stripe.Invoice) => {
  if (invoice.status === 'paid' || invoice.paid) {
    return 'PAID';
  }

  if (
    invoice.status === 'uncollectible'
    || (invoice.status === 'open' && invoice.due_date !== null && invoice.due_date * 1000 < Date.now())
  ) {
    return 'OVERDUE';
  }

  return normalizePaymentStatus(invoice.status ?? 'pending');
};

const resolveOrganizationId = async (invoice: Stripe.Invoice) => {
  const metadataOrganizationId = invoice.metadata?.organizationId;

  if (metadataOrganizationId) {
    const byId = await getOrganizationById(metadataOrganizationId);
    if (byId) {
      return byId.id;
    }
  }

  const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

  if (!customerId) {
    return null;
  }

  const byCustomerId = await getOrganizationByStripeCustomerId(customerId);

  return byCustomerId?.id ?? null;
};

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, Env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logger.error({ error }, 'Failed to verify Stripe webhook signature');

    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
  }

  if (!event.type.startsWith('invoice.')) {
    return NextResponse.json({ received: true });
  }

  const invoice = event.data.object as Stripe.Invoice;
  const organizationId = await resolveOrganizationId(invoice);

  if (!organizationId) {
    logger.warn(
      {
        customer: invoice.customer,
        eventType: event.type,
        invoiceId: invoice.id,
      },
      'Stripe invoice event ignored because no tenant mapping was found',
    );

    return NextResponse.json({ received: true, skipped: true });
  }

  const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : null;

  await upsertPayment({
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    dueDate: toDate(invoice.due_date),
    id: invoice.id,
    organizationId,
    paidAt: toDate(invoice.status_transitions?.paid_at ?? null),
    periodEnd: toDate(invoice.period_end),
    periodStart: toDate(invoice.period_start),
    rawPayload: invoice as unknown as Record<string, unknown>,
    status: getInvoiceStatus(invoice),
    stripeCustomerId,
    stripeInvoiceId: invoice.id,
  });

  logger.info(
    {
      eventType: event.type,
      invoiceId: invoice.id,
      organizationId,
    },
    'Stripe invoice event synced',
  );

  return NextResponse.json({ received: true });
}
