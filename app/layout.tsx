import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadMate",
  description: "영업 고객과 후속 연락을 관리하는 맞춤형 CRM"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
