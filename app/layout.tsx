import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadMate V1",
  description: "분양 영업 고객 DB와 재연락을 관리하는 초간단 CRM"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
