import type { Metadata } from "next";
import { PdfViewer } from "@/components/PdfViewer";
import { headers } from "next/headers";
import type { PresentationMetaResponse } from "@/types/presentation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

interface PresentationPageProps {
  params: {
    code: string;
  };
}

export default async function PresentationPage({ params }: PresentationPageProps) {
  const code = params.code.toUpperCase();

  const headerList = headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = host
    ? `${proto}://${host}`
    : (process.env.APP_URL ?? "http://localhost:3000");

  const response = await fetch(`${baseUrl}/api/presentations/${code}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">代碼無效或已過期</h1>
      </main>
    );
  }

  const data = (await response.json()) as PresentationMetaResponse;
  const expiresAt = typeof data?.expiresAt === "string" ? data.expiresAt : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <PdfViewer code={code} expiresAt={expiresAt} />
    </main>
  );
}
