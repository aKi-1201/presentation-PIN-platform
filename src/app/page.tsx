"use client";

import { UploadForm } from "@/components/UploadForm";
import { CodeInput } from "@/components/CodeInput";
import type { UploadResponse } from "@/types/presentation";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleSuccess = (result: UploadResponse) => {
    const manageToken = result.manageUrl.split("/").filter(Boolean).pop() ?? "";
    const params = new URLSearchParams({
      code: result.code,
      manageToken,
      expiresAt: result.expiresAt
    });

    router.push(`/upload/success?${params.toString()}`);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:py-16">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">Presentation PIN Platform</h1>
        <p>
          不用 USB，不用登入雲端硬碟。上傳 PDF，取得簡報代碼，到任何電腦輸入代碼即可開始簡報。
        </p>
        <p>檔案將於指定期限後自動刪除。請勿上傳高度機密、敏感個資或未授權公開的文件。</p>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2 lg:gap-8">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">上傳 PDF</h2>
          <UploadForm onSuccess={handleSuccess} />
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">輸入簡報代碼</h2>
          <CodeInput />
        </div>
      </section>
    </main>
  );
}
