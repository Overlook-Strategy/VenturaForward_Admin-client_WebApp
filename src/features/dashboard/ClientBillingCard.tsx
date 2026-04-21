type ClientPayment = {
  amountDue: number;
  amountPaid: number;
  createdAt: Date;
  currency: string;
  dueDate: Date | null;
  id: string;
  status: string;
};

const formatCurrency = (amount: number, currency: string) => {
  const normalized = currency.toUpperCase() || 'USD';

  return new Intl.NumberFormat('en-US', {
    currency: normalized,
    style: 'currency',
  }).format(amount / 100);
};

const getStatusTone = (status: string) => {
  if (status === 'PAID') {
    return 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100';
  }

  if (status === 'OVERDUE') {
    return 'border-rose-300/35 bg-rose-500/20 text-rose-100';
  }

  return 'border-amber-300/35 bg-amber-400/20 text-amber-100';
};

const formatDate = (value: Date | null) => {
  if (!value) {
    return 'N/A';
  }

  return value.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const ClientBillingCard = (props: {
  payments: ClientPayment[];
}) => {
  const openInvoices = props.payments.filter(payment => payment.status !== 'PAID');

  return (
    <section className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Billing</h2>
        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/70">
          {openInvoices.length} open
        </span>
      </div>

      {!props.payments.length && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/75">
          No Stripe invoices are synced yet.
        </div>
      )}

      <div className="space-y-3">
        {props.payments.slice(0, 6).map(payment => (
          <article
            key={payment.id}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-white/90">Invoice {payment.id}</p>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(payment.status)}`}
              >
                {payment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Amount due</div>
                <div className="mt-0.5 font-semibold text-white">
                  {formatCurrency(payment.amountDue, payment.currency)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Amount paid</div>
                <div className="mt-0.5 font-semibold text-white">
                  {formatCurrency(payment.amountPaid, payment.currency)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Due date</div>
                <div className="mt-0.5">{formatDate(payment.dueDate)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-white/55">Synced</div>
                <div className="mt-0.5">{formatDate(payment.createdAt)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
