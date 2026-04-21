'use client';

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import { ActiveLink } from '@/components/ActiveLink';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/templates/Logo';
import { getI18nPath } from '@/utils/Helpers';

export const DashboardHeader = (props: {
  menu: {
    href: string;
    label: string;
  }[];
}) => {
  const locale = useLocale();

  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/dashboard" className="hidden shrink-0 lg:block">
          <Logo />
        </Link>

        <div className="hidden h-8 w-px bg-white/20 lg:block" />

        <OrganizationSwitcher
          organizationProfileMode="navigation"
          organizationProfileUrl={getI18nPath(
            '/dashboard/organization-profile',
            locale,
          )}
          afterCreateOrganizationUrl="/dashboard"
          hidePersonal
          skipInvitationScreen
          appearance={{
            elements: {
              organizationSwitcherTrigger: 'max-w-44 rounded-xl border border-white/25 bg-white/10 px-2 py-1 text-white backdrop-blur-sm hover:bg-white/20',
            },
          }}
        />

        <nav className="ml-1 hidden lg:block">
          <ul className="flex flex-row items-center gap-x-1 text-sm font-medium">
            {props.menu.map(item => (
              <li key={item.href}>
                <ActiveLink
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-white/72 transition hover:bg-white/12 hover:text-white"
                  activeClassName="bg-cyan-300/20 text-cyan-100"
                >
                  {item.label}
                </ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <ul className="flex items-center gap-x-2">
          <li className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToggleMenuButton />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-white/15 bg-slate-950/95 text-white backdrop-blur-xl">
                {props.menu.map(item => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          <li className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-white backdrop-blur-sm">
            <LocaleSwitcher />
          </li>

          <li>
            <Separator orientation="vertical" className="h-4 bg-white/25" />
          </li>

          <li>
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/dashboard/user-profile"
              appearance={{
                elements: {
                  rootBox: 'rounded-full border border-white/20 bg-white/10 px-1.5 py-1 backdrop-blur-sm',
                },
              }}
            />
          </li>
        </ul>
      </div>
    </>
  );
};
