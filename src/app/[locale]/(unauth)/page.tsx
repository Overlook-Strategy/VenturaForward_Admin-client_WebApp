import Link from 'next/link';
import { unstable_setRequestLocale } from 'next-intl/server';

import { Logo } from '@/templates/Logo';

export async function generateMetadata(props: { params: { locale: string } }) {
  return {
    title: props.params.locale === 'fr'
      ? 'Ventura Forward | Tableau de bord marketing social media'
      : 'Ventura Forward | Social Media Marketing Ops Portal',
    description: props.params.locale === 'fr'
      ? 'Portail d operations Ventura Forward pour les campagnes social media, la publication des ads et le suivi de facturation.'
      : 'Ventura Forward operations portal for social media campaign delivery, ad post tracking, and invoice visibility.',
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-28 size-80 rounded-full bg-brand-secondary/30 blur-[90px]" />
      <div className="pointer-events-none absolute -right-32 top-6 size-96 rounded-full bg-brand-primary/25 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <header className="vf-glass mb-10 flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />

          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-full px-4 py-2 font-medium text-foreground/80 transition hover:bg-white/70 hover:text-foreground" href="/sign-in">
              Admin Login
            </Link>
            <Link className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90" href="/sign-up">
              Start Onboarding
            </Link>
          </nav>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-slate-950 px-6 py-12 text-white shadow-2xl shadow-slate-900/35 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 vf-grid-background opacity-30" />
          <div className="pointer-events-none absolute -top-28 right-0 size-80 rounded-full bg-cyan-300/20 blur-[105px]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="vf-kicker text-cyan-200">Social Media Growth Operations</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Agency-grade campaign delivery for high-velocity local brands.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
                Ventura Forward runs content scheduling, paid ad execution, and monthly performance reporting through one shared workspace for your team and your clients.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300" href="/dashboard/client">
                  View Client Dashboard
                </Link>
                <Link className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/dashboard/agency">
                  Open Agency Ops
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <article className="vf-glass vf-float p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Live Post Timeline</p>
                <p className="mt-2 text-2xl font-semibold">Track ad publish dates, engagement, and campaign cadence.</p>
              </article>

              <article className="vf-glass p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Billing Visibility</p>
                <p className="mt-2 text-lg text-slate-100">
                  Keep clients synced on paid invoices, open balances, and due dates without back-and-forth email threads.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              body: 'Centralized intake forms, onboarding data, and campaign context for every new client.',
              title: 'Intake Pipeline',
            },
            {
              body: 'Admin portal mirrors agency workflows: project health, post quotas, invoice tracking.',
              title: 'Agency Command Center',
            },
            {
              body: 'Client portal highlights publish activity, payment status, and latest deliverables.',
              title: 'Client Transparency',
            },
          ].map(item => (
            <article key={item.title} className="vf-card p-5">
              <p className="vf-kicker">Ventura Forward</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default IndexPage;
