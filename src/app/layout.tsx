import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Presentation PIN Platform",
  description: "Temporary presentation access platform."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-white text-slate-900">{children}</body>
    </html>
  );
}
