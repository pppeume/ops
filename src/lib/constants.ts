// 상태값/배지 정의 — DB는 코드값, UI는 한글 라벨로 표기.

export type StatusMeta = { label: string; tone: Tone };
export type Tone = "blue" | "green" | "amber" | "red" | "gray" | "violet";

export const ORDER_STATUS: Record<string, StatusMeta> = {
  RECEIVED: { label: "접수", tone: "gray" },
  IN_PROGRESS: { label: "진행", tone: "blue" },
  COMPLETED: { label: "완료", tone: "green" },
  CLOSED: { label: "마감", tone: "violet" },
};

export const ORDER_STATUS_FLOW = ["RECEIVED", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;

export const CONTRACT_STATUS: Record<string, StatusMeta> = {
  DRAFT: { label: "작성중", tone: "gray" },
  ACTIVE: { label: "계약중", tone: "green" },
  EXPIRED: { label: "만료", tone: "amber" },
  TERMINATED: { label: "해지", tone: "red" },
};

export const COMMON_STATUS: Record<string, StatusMeta> = {
  ACTIVE: { label: "사용", tone: "green" },
  INACTIVE: { label: "미사용", tone: "gray" },
};

export const PAYMENT_STATUS: Record<string, StatusMeta> = {
  PENDING: { label: "대기", tone: "amber" },
  CONFIRMED: { label: "확정", tone: "green" },
};

export const GRADE: Record<string, StatusMeta> = {
  A: { label: "A (우수)", tone: "green" },
  B: { label: "B (양호)", tone: "blue" },
  C: { label: "C (보통)", tone: "amber" },
  D: { label: "D (미흡)", tone: "red" },
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "시스템 관리자",
  MANAGER: "운영 관리자",
  STAFF: "현장 담당자",
  VIEWER: "조회 전용",
};

export const toneClasses: Record<Tone, string> = {
  blue: "bg-brand-50 text-brand-700 ring-brand-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  gray: "bg-ink-100 text-ink-600 ring-ink-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function statusMeta(map: Record<string, StatusMeta>, key: string): StatusMeta {
  return map[key] ?? { label: key, tone: "gray" };
}
