import { AdminBrandQuotaTable } from '@/features/dashboard/AdminBrandQuotaTable';
import { getAdminDashboardData } from '@/libs/AgencyData';
import { getDashboardAccessContext } from '@/libs/AccessControl';

const AgencyDashboardPage = async () => {
  const access = await getDashboardAccessContext();

  if (!access.isSuperAdmin) {
    return (
      <div className="rounded-3xl border border-white/20 bg-black p-6 text-white">
        <h1 className="text-2xl font-semibold">Restricted</h1>
        <p className="mt-2 text-sm text-white/70">
          This view is reserved for Ventura Forward super-admin users.
        </p>
      </div>
    );
  }

  const rows = await getAdminDashboardData();

  return (
    <div className="rounded-3xl border border-white/20 bg-black p-6 text-white">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Global Operations</p>
        <h1 className="mt-2 text-3xl font-semibold">All Partner Brands</h1>
      </div>

      <AdminBrandQuotaTable rows={rows} />
    </div>
  );
};

export default AgencyDashboardPage;
