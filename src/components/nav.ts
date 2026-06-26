import type { IconKey } from "./icons";

export type NavItem = { href: string; label: string; icon: IconKey };
export type NavGroup = { title: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    title: "운영",
    items: [
      { href: "/dashboard", label: "대시보드", icon: "dashboard" },
      { href: "/contracts", label: "계약", icon: "contract" },
      { href: "/orders", label: "발주", icon: "order" },
    ],
  },
  {
    title: "정산 · 분석",
    items: [
      { href: "/settlement", label: "정산", icon: "settlement" },
      { href: "/analysis", label: "분석", icon: "analysis" },
      { href: "/reports", label: "보고서", icon: "report" },
    ],
  },
  {
    title: "기준정보",
    items: [
      { href: "/sites", label: "사업소", icon: "site" },
      { href: "/clients", label: "발주처", icon: "client" },
      { href: "/partners", label: "협력업체", icon: "partner" },
      { href: "/master", label: "기준 코드", icon: "master" },
    ],
  },
  {
    title: "시스템",
    items: [
      { href: "/notices", label: "공지사항", icon: "notice" },
      { href: "/users", label: "사용자·권한", icon: "users" },
    ],
  },
];
