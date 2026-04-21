'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/Helpers';

export const ActiveLink = (props: {
  activeClassName?: string;
  children: React.ReactNode;
  className?: string;
  href: string;
  inactiveClassName?: string;
}) => {
  const pathname = usePathname();
  const isActive = pathname.endsWith(props.href);

  return (
    <Link
      href={props.href}
      className={cn(
        'px-3 py-2',
        props.className,
        isActive
          ? props.activeClassName ?? 'rounded-md bg-primary text-primary-foreground'
          : props.inactiveClassName,
      )}
    >
      {props.children}
    </Link>
  );
};
