type MonthlySummaryEmailInput = {
  avgEngagement: number;
  brandName: string;
  month: number;
  overdueCount: number;
  paidCount: number;
  pendingCount: number;
  postCount: number;
  quotaFulfilled: boolean;
  quotaTarget: number;
  year: number;
};

const formatMonthLabel = (month: number, year: number) => {
  const date = new Date(Date.UTC(year, month - 1, 1));

  return date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const buildMonthlySummaryEmailHtml = (input: MonthlySummaryEmailInput) => {
  const monthLabel = formatMonthLabel(input.month, input.year);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${input.brandName} Monthly Performance</title>
  </head>
  <body style="margin:0;background:#060606;color:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:40px 20px;">
      <div style="border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);border-radius:24px;padding:28px;backdrop-filter:blur(18px);">
        <h1 style="margin:0 0 10px;font-size:30px;line-height:1.2;font-weight:600;">${input.brandName}</h1>
        <p style="margin:0 0 20px;color:#d4d4d4;font-size:16px;">Monthly performance report for ${monthLabel}</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 10px;">
          <tr>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);">Posts published</td>
            <td style="padding:14px 16px;text-align:right;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);font-weight:600;">${input.postCount}</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);">Promo quota</td>
            <td style="padding:14px 16px;text-align:right;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);font-weight:600;">${input.postCount}/${input.quotaTarget} (${input.quotaFulfilled ? 'Fulfilled' : 'Behind'})</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);">Average engagement per post</td>
            <td style="padding:14px 16px;text-align:right;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);font-weight:600;">${input.avgEngagement.toFixed(1)}</td>
          </tr>
          <tr>
            <td style="padding:14px 16px;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);">Invoices (Paid / Pending / Overdue)</td>
            <td style="padding:14px 16px;text-align:right;border:1px solid rgba(255,255,255,0.14);border-radius:14px;background:rgba(255,255,255,0.04);font-weight:600;">${input.paidCount} / ${input.pendingCount} / ${input.overdueCount}</td>
          </tr>
        </table>

        <p style="margin:20px 0 0;color:#bababa;font-size:13px;line-height:1.6;">This report was generated automatically by Ventura Forward.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
};
