"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth";

export function Topbar({ user, unread }: { user: SessionUser; unread: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initial = user.name?.[0] ?? "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200/70 bg-white/80 px-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Icon.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="발주번호, 사업소, 협력업체 검색"
            className="w-72 rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-ink-500 transition hover:bg-ink-50 hover:text-ink-800" aria-label="알림">
          <Icon.bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-ink-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-sm font-semibold text-ink-800">{user.name}</div>
              <div className="text-[11px] text-ink-400">{ROLE_LABELS[user.role] ?? user.roleName}</div>
            </div>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 animate-fade-in rounded-xl border border-ink-200 bg-white p-1.5 shadow-soft">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-ink-800">{user.name}</p>
                  <p className="text-xs text-ink-400">{user.email}</p>
                </div>
                <div className="my-1 border-t border-ink-100" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Icon.logout className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
