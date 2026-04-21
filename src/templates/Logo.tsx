import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold tracking-tight text-foreground">
    <svg
      className="mr-2 size-8"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="vfLogoGradient" x1="8" x2="56" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(214 84% 44%)" />
          <stop offset="1" stopColor="hsl(188 82% 46%)" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="52" height="48" rx="14" fill="url(#vfLogoGradient)" />
      <path d="M17 42 28 22l8 12 6-8 5 16" stroke="white" strokeWidth="4" />
      <circle cx="46" cy="26" r="3" fill="white" />
    </svg>
    {!props.isTextHidden && AppConfig.name}
  </div>
);
