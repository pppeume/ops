"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ReportToolbar({ regions }: { regions: { id: number; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const region = params.get("region") ?? "";

  function setRegion(v: string) {
    const p = new URLSearchParams(params.toString());
    if (v) p.set("region", v);
    else p.delete("region");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <select value={region} onChange={(e) => setRegion(e.target.value)} className="input w-40 py-2 text-sm">
        <option value="">전체 권역</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      <a
        href={`/api/reports/export${region ? `?region=${region}` : ""}`}
        className="btn-ghost"
        download
      >
        Excel 다운로드
      </a>
      <button onClick={() => window.print()} className="btn-primary">
        PDF / 인쇄
      </button>
    </div>
  );
}
