import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AdminBrandRow = {
  currentMonthPosts: number;
  lastPaymentStatus: string;
  monthlyAdQuota: number;
  organizationId: string;
  organizationName: string;
  overdueInvoices: number;
};

const statusPillClass = (status: string) => {
  if (status === 'PAID') {
    return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100';
  }

  if (status === 'OVERDUE') {
    return 'border-rose-400/35 bg-rose-500/20 text-rose-100';
  }

  return 'border-amber-400/35 bg-amber-400/20 text-amber-100';
};

export const AdminBrandQuotaTable = (props: {
  rows: AdminBrandRow[];
}) => {
  return (
    <section className="vf-glass p-6 text-white">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="vf-kicker text-cyan-200">Agency ops</p>
          <h2 className="mt-2 text-xl font-semibold">Brand operations</h2>
          <p className="text-sm text-white/70">Global view across all active client organizations.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/25">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/65">Brand</TableHead>
              <TableHead className="text-right text-white/65">Quota</TableHead>
              <TableHead className="text-right text-white/65">Posts</TableHead>
              <TableHead className="text-right text-white/65">Fill Rate</TableHead>
              <TableHead className="text-right text-white/65">Overdue</TableHead>
              <TableHead className="text-right text-white/65">Payment</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {props.rows.map(row => {
              const ratio = row.monthlyAdQuota > 0
                ? Math.min(100, Math.round((row.currentMonthPosts / row.monthlyAdQuota) * 100))
                : 0;

              return (
                <TableRow key={row.organizationId} className="border-white/10 text-white/90 hover:bg-white/5">
                  <TableCell className="font-medium">{row.organizationName}</TableCell>
                  <TableCell className="text-right">{row.monthlyAdQuota}</TableCell>
                  <TableCell className="text-right">{row.currentMonthPosts}</TableCell>
                  <TableCell className="text-right">{ratio}%</TableCell>
                  <TableCell className="text-right">{row.overdueInvoices}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusPillClass(row.lastPaymentStatus)}`}
                    >
                      {row.lastPaymentStatus}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
