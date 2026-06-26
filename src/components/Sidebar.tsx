"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";
import { Icon } from "./icons";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200/70 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-base font-black text-white">
          K
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight text-ink-900">KIOT OPS</div>
          <div className="text-[10px] font-medium text-ink-400">유지보수 운영 플랫폼</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconCmp = Icon[item.icon];
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    )}
                  >
                    <IconCmp className={cn("h-[18px] w-[18px]", active ? "text-brand-600" : "text-ink-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <div className="rounded-lg bg-ink-50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
          <p className="font-semibold text-ink-600">운영 흐름</p>
          <p>계약 → 발주 → 진행 → 정산</p>
        </div>
      </div>
    </aside>
  );
}
