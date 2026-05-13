import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToasterClient } from "@/components/ToasterClient";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://zlide.app"),
  title: "Zlide - 上傳簡報，取得代碼，到哪都能立即開講",
  description:
    "Zlide 是臨時簡報存取工具。上傳 PDF 簡報，取得簡報代碼，在任何電腦輸入代碼即可開始簡報，檔案將於指定期限後自動刪除。",
  applicationName: "Zlide",
  keywords: [
    "Zlide",
    "簡報代碼",
    "簡報碼",
    "PDF 簡報",
    "臨時簡報",
    "線上簡報",
    "不用 USB",
    "presentation code",
    "PDF presentation",
    "temporary presentation access"
  ],
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className={`${inter.className} min-h-screen bg-white text-slate-900`}>
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
