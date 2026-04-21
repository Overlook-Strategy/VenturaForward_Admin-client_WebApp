import { getTranslations } from 'next-intl/server';

import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative border-b border-white/15 bg-slate-950 text-white shadow-xl shadow-slate-950/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_50%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(37,99,235,0.22),transparent_32%)]" />
        <div className="relative mx-auto flex max-w-[1400px] items-center justify-between px-3 py-4 sm:px-5 lg:px-8">
          <DashboardHeader
            menu={[
              {
                href: '/dashboard',
                label: 'Overview',
              },
              {
                href: '/dashboard/client',
                label: 'Client Workspace',
              },
              {
                href: '/dashboard/agency',
                label: 'Agency Ops',
              },
              {
                href: '/dashboard/organization-profile/organization-members',
                label: 'Members',
              },
              {
                href: '/dashboard/organization-profile',
                label: 'Settings',
              },
            ]}
          />
        </div>
      </div>

      <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-[1400px] px-3 pb-16 pt-6 sm:px-5 lg:px-8">
          {props.children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
