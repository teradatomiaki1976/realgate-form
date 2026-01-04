// src/app/layout.tsx
import type { Metadata } from "next";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
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
  title: "わたしのお守り総合補償制度 お申込み",
  description: "説明文言が入ります",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={bodyFont.variable}>
      <body className={bodyFont.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
