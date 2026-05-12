import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToasterClient } from "@/components/ToasterClient";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zlide",
  description: "Temporary presentation access platform."
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
