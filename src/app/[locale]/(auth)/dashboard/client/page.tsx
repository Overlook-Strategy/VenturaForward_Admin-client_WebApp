import { ClientBillingCard } from '@/features/dashboard/ClientBillingCard';
import { ClientPostTimeline } from '@/features/dashboard/ClientPostTimeline';
import { ClientIntakeForm } from '@/features/onboarding/ClientIntakeForm';
import { getClientDashboardData } from '@/libs/AgencyData';
import { getDashboardAccessContext } from '@/libs/AccessControl';

const ClientDashboardPage = async () => {
  const access = await getDashboardAccessContext();

  if (!access.orgId) {
    return (
      <div className="vf-glass p-6 text-white">
        <h1 className="text-2xl font-semibold">No client selected</h1>
        <p className="mt-2 text-sm text-white/70">
          Select a Ventura Forward client organization to load post history and billing status.
        </p>
      </div>
    );
  }

  const data = await getClientDashboardData(access.orgId);

  if (!data) {
    return (
      <div className="vf-glass p-6 text-white">
        <h1 className="text-2xl font-semibold">Client profile not configured</h1>
        <p className="mt-2 text-sm text-white/70">
          No dashboard profile is saved for this organization yet.
        </p>
      </div>
    );
  }

  if (!data.organization) {
    return (
      <div className="vf-glass p-6 text-white">
        <h1 className="text-2xl font-semibold">Client record missing</h1>
        <p className="mt-2 text-sm text-white/70">
          The selected organization could not be loaded.
        </p>
      </div>
    );
  }

  if (!data.clientProfile) {
    return (
      <div className="space-y-5">
        <div className="vf-card p-5">
          <p className="vf-kicker">Onboarding required</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Complete client intake</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out your Ventura Forward services profile before entering the dashboard.
          </p>
        </div>
        <ClientIntakeForm
          initialValues={{
            businessName: data.organization.displayName,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="vf-glass p-6 text-white">
        <p className="vf-kicker text-cyan-200">Client workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{data.organization.displayName}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/72">
          This view shows when ads were posted, which invoices are open, and what Ventura Forward has queued next.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <ClientPostTimeline
          posts={data.posts.map(post => ({
            commentCount: post.commentCount,
            engagementCount: post.engagementCount,
            id: post.id,
            likeCount: post.likeCount,
            postUrl: post.postUrl,
            postedAt: post.postedAt,
          }))}
        />
        <ClientBillingCard
          payments={data.payments.map(payment => ({
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
    </div>
  );
};

export default ClientDashboardPage;
