"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("admin@kolon.com");
  const [password, setPassword] = useState("admin1234do!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "로그인에 실패했습니다.");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(1000px 500px at 15% -10%, #1f47f5 0%, transparent 55%), radial-gradient(800px 600px at 90% 110%, #1a2d8f 0%, transparent 50%), linear-gradient(160deg, #141d57 0%, #14161f 100%)",
          }}
        />
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-2.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg font-black backdrop-blur">
              K
            </div>
            <span className="text-lg font-bold tracking-tight">KIOT OPS</span>
          </div>
        </div>
        <div className="relative z-10 p-12">
          <h2 className="text-3xl font-bold leading-snug text-white">
            외주·유지보수 운영을
            <br />
            하나의 흐름으로.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            계약 → 발주 → 진행 → 비용 → 정산 → 분석까지. 사업소별 운영 현황과
            협력업체 성과를 실시간으로 관리하는 통합 플랫폼.
          </p>
          <div className="mt-8 flex gap-6 text-white/50">
            {[
              ["7", "사업소"],
              ["34", "발주"],
              ["6", "협력업체"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-black text-white">
                K
              </div>
              <span className="text-lg font-bold tracking-tight text-ink-900">KIOT OPS</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink-900">로그인</h1>
          <p className="mt-1.5 text-sm text-ink-500">운영 플랫폼 계정으로 로그인하세요.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/15">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-3 text-xs text-ink-500">
            <p className="font-medium text-ink-600">데모 계정</p>
            <p className="mt-1">관리자 · admin@kolon.com / admin1234do!</p>
            <p>운영자 · manager@kolon.com / user1234!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
