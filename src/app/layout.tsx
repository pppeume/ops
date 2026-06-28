import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIOT OPS — 외주·유지보수 통합 운영 플랫폼",
  description:
    "계약·발주·진행·정산·분석을 한 곳에서 관리하는 외주/유지보수 운영 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f47f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
