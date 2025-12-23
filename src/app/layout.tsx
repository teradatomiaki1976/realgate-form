// src/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.scss";
import { Noto_Sans_JP } from "next/font/google";

const bodyFont = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "保険申し込みフォーム",
  description: "リアルゲート案件：保険申し込みフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={bodyFont.variable}>
      <body>{children}</body>
    </html>
  );
}
