import { AdminBrandQuotaTable } from '@/features/dashboard/AdminBrandQuotaTable';
import { ClientBillingCard } from '@/features/dashboard/ClientBillingCard';
import { ClientPostTimeline } from '@/features/dashboard/ClientPostTimeline';
import { getAdminDashboardData, getClientDashboardData } from '@/libs/AgencyData';
import { getDashboardAccessContext } from '@/libs/AccessControl';

const EmptyStateCard = (props: { message: string; title: string }) => (
  <div className="vf-glass p-6 text-white">
    <h2 className="text-lg font-semibold">{props.title}</h2>
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
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/45 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.12),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.1),transparent_32%)]" />

      <div className="relative z-10 space-y-6">
        <section className="vf-glass px-6 py-5">
          <p className="vf-kicker text-cyan-200">Ventura Forward</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Agency operations dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/72">
            Track when each ad post went live, review invoice balances, and monitor monthly campaign delivery across every client brand.
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
                title="No active client selected"
                message="Select or create an organization in the switcher to view post dates, payment status, and campaign delivery data."
              />
            )}
      </div>
    </div>
  );
};

export default DashboardIndexPage;
