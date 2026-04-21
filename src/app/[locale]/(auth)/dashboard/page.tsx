import { AdminBrandQuotaTable } from '@/features/dashboard/AdminBrandQuotaTable';
import { ClientBillingCard } from '@/features/dashboard/ClientBillingCard';
import { ClientPostTimeline } from '@/features/dashboard/ClientPostTimeline';
import { getAdminDashboardData, getClientDashboardData } from '@/libs/AgencyData';
import { getDashboardAccessContext } from '@/libs/AccessControl';

const EmptyStateCard = (props: { message: string; title: string }) => (
  <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
    <h2 className="text-lg font-semibold text-white">{props.title}</h2>
    <p className="mt-2 text-sm text-white/70">{props.message}</p>
  </div>
);

const DashboardIndexPage = async () => {
  const access = await getDashboardAccessContext();
  const clientData = access.orgId
    ? await getClientDashboardData(access.orgId)
    : null;

  const adminRows = access.isSuperAdmin
    ? await getAdminDashboardData()
    : [];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-black p-6 text-white shadow-2xl shadow-black/40 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.14),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(255,255,255,0.08),transparent_32%)]" />

      <div className="relative z-10 space-y-6">
        <section className="rounded-3xl border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Ventura Forward</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Agency Operations Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75">
            Track tagged Instagram promos, monitor payment health, and maintain monthly ad quota execution across every partner brand.
          </p>
        </section>

        {access.isSuperAdmin && <AdminBrandQuotaTable rows={adminRows} />}

        {clientData
          ? (
              <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                <ClientPostTimeline
                  posts={clientData.posts.map(post => ({
                    commentCount: post.commentCount,
                    engagementCount: post.engagementCount,
                    id: post.id,
                    likeCount: post.likeCount,
                    postUrl: post.postUrl,
                    postedAt: post.postedAt,
                  }))}
                />
                <ClientBillingCard
                  payments={clientData.payments.map(payment => ({
                    amountDue: payment.amountDue,
                    amountPaid: payment.amountPaid,
                    createdAt: payment.createdAt,
                    currency: payment.currency,
                    dueDate: payment.dueDate,
                    id: payment.id,
                    status: payment.status,
                  }))}
                />
              </div>
            )
          : (
              <EmptyStateCard
                title="No active tenant selected"
                message="Select or create an organization in the switcher to view brand-level promo and billing data."
              />
            )}
      </div>
    </div>
  );
};

export default DashboardIndexPage;
