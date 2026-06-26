import Link from "next/link";
import { cn } from "@/lib/utils";
import { toneClasses, statusMeta, type StatusMeta, type Tone } from "@/lib/constants";

export function Badge({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={cn("badge", toneClasses[tone])}>{children}</span>;
}

export function StatusBadge({ map, value }: { map: Record<string, StatusMeta>; value: string }) {
  const m = statusMeta(map, value);
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
      <h2 className="text-sm font-semibold text-ink-800">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  accent = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: { dir: "up" | "down"; value: string };
  accent?: "brand" | "emerald" | "amber" | "violet";
}) {
  const accents: Record<string, string> = {
    brand: "from-brand-500 to-brand-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    violet: "from-violet-500 to-violet-600",
  };
  return (
    <Card className="relative overflow-hidden p-5">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accents[accent])} />
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trend.dir === "up" ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.dir === "up" ? "▲" : "▼"} {trend.value}
          </span>
        )}
        {sub && <span className="text-xs text-ink-400">{sub}</span>}
      </div>
    </Card>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("th", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("td", className)}>{children}</td>;
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ink-100">{children}</table>
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <Link href={href} className={variant === "primary" ? "btn-primary" : "btn-ghost"}>
      {children}
    </Link>
  );
}
