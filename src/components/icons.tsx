import { cn } from "@/lib/utils";

type IconProps = { className?: string };
const base = "h-5 w-5";

function S({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(base, className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const Icon = {
  dashboard: (p: IconProps) => (
    <S {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </S>
  ),
  contract: (p: IconProps) => (
    <S {...p}>
      <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 17h4" />
    </S>
  ),
  order: (p: IconProps) => (
    <S {...p}>
      <path d="M9 3h6l1 2h3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5h3z" />
      <path d="M9 11l2 2 4-4" />
    </S>
  ),
  site: (p: IconProps) => (
    <S {...p}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 11h.01M15 11h.01" />
    </S>
  ),
  partner: (p: IconProps) => (
    <S {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 4a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9" />
    </S>
  ),
  client: (p: IconProps) => (
    <S {...p}>
      <rect x="4" y="7" width="16" height="13" rx="1.5" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M4 12h16" />
    </S>
  ),
  settlement: (p: IconProps) => (
    <S {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.6-2.5 1.6-2.5.7-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.7 2.5-1.7" />
    </S>
  ),
  analysis: (p: IconProps) => (
    <S {...p}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 17v-5M12 17v-9M16 17v-3M20 17V8" />
    </S>
  ),
  report: (p: IconProps) => (
    <S {...p}>
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M8 13h8M8 17h5" />
    </S>
  ),
  notice: (p: IconProps) => (
    <S {...p}>
      <path d="M3 11l14-6v14L3 13z" />
      <path d="M17 8a3 3 0 0 1 0 8" />
      <path d="M7 13v4a2 2 0 0 0 4 0" />
    </S>
  ),
  users: (p: IconProps) => (
    <S {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M16 20a4.5 4.5 0 0 1 5.5-4.4" />
    </S>
  ),
  master: (p: IconProps) => (
    <S {...p}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </S>
  ),
  bell: (p: IconProps) => (
    <S {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </S>
  ),
  logout: (p: IconProps) => (
    <S {...p}>
      <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </S>
  ),
  plus: (p: IconProps) => (
    <S {...p}>
      <path d="M12 5v14M5 12h14" />
    </S>
  ),
  search: (p: IconProps) => (
    <S {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </S>
  ),
  chevronRight: (p: IconProps) => (
    <S {...p}>
      <path d="m9 6 6 6-6 6" />
    </S>
  ),
  arrowUp: (p: IconProps) => (
    <S {...p}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </S>
  ),
  arrowDown: (p: IconProps) => (
    <S {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </S>
  ),
  check: (p: IconProps) => (
    <S {...p}>
      <path d="M20 6 9 17l-5-5" />
    </S>
  ),
  building: (p: IconProps) => (
    <S {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h0M15 7h0M9 11h0M15 11h0M9 15h0M15 15h0" />
      <path d="M10 21v-3h4v3" />
    </S>
  ),
  menu: (p: IconProps) => (
    <S {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </S>
  ),
};

export type IconKey = keyof typeof Icon;
