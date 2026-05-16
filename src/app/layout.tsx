import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToasterClient } from "@/components/ToasterClient";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://zlide.app"),
  title: "Zlide - 到任何電腦，立即開始簡報",
  description:
    "不用 USB，不用登入 Google Drive。上傳 PDF 取得簡報代碼，在教室、會議室、任何電腦輸入代碼即可開講。檔案到期自動刪除，不留痕跡。",
  applicationName: "Zlide",
  keywords: [
    "Zlide",
    "簡報代碼",
    "簡報碼",
    "PDF 簡報",
    "會議室簡報",
    "教室簡報",
    "公用電腦簡報",
    "簡報分享",
    "無需登入簡報",
    "不用 USB",
    "presentation code",
    "PDF presentation",
    "share presentation without login",
    "present on any computer",
    "no USB presentation",
    "temporary presentation"
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
