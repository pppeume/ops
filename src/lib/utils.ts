import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KRW = new Intl.NumberFormat("ko-KR");

/** 원 단위 금액 포맷 (예: 12,500,000원) */
export function formatKRW(n: number): string {
  return `${KRW.format(n)}원`;
}

/** 백만원 단위 축약 (대시보드 카드용, 예: 12.5백만) */
export function formatKRWShort(n: number): string {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;
  return KRW.format(n);
}

export function formatNumber(n: number): string {
  return KRW.format(n);
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** 수익률(%) 계산 — 입금 대비 수익. 입금 0이면 0 반환. */
export function profitRate(income: number, cost: number): number {
  if (income <= 0) return 0;
  return Math.round(((income - cost) / income) * 1000) / 10;
}
