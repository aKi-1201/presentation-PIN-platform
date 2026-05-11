"use client";

import { UploadForm, type UploadFormHandle } from "@/components/UploadForm";
import { CodeInput } from "@/components/CodeInput";
import type { UploadResponse } from "@/types/presentation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const uploadFormRef = useRef<UploadFormHandle>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSuccess = (result: UploadResponse) => {
    const manageToken = result.manageUrl.split("/").filter(Boolean).pop() ?? "";
    const params = new URLSearchParams({
      code: result.code,
      manageToken,
      expiresAt: result.expiresAt
    });

    router.push(`/upload/success?${params.toString()}`);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { relatedTarget, currentTarget } = event;
    if (relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      uploadFormRef.current?.handleExternalFile(droppedFile);
    }
  };

  const uploadCardClasses = "space-y-4";

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-10 sm:gap-12 sm:px-8 sm:py-14 lg:py-16">
      <Link
        className="fixed top-6 left-6 z-50 text-2xl font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:text-slate-900"
        href="/"
      >
        Zlide
      </Link>
      <section className="w-full max-w-3xl text-center">
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">輸入簡報代碼</h1>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          不用 USB，不用登入雲端硬碟。輸入代碼即可在任何電腦開啟簡報。
        </p>
        <div className="mt-8 sm:mt-10">
          <CodeInput variant="hero" autoFocus />
        </div>
      </section>

      <section className="w-full max-w-3xl space-y-4">
        <div
          className={uploadCardClasses}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <h2 className="mb-3 text-base font-semibold text-slate-900">上傳 PDF</h2>
          <p className="mb-4 text-sm text-slate-400 sm:text-base">
            拖曳 PDF 到此，或點選下方選擇檔案。
          </p>
          <UploadForm ref={uploadFormRef} onSuccess={handleSuccess} isDragging={isDragging} />
        </div>
        <p className="text-xs text-slate-400 sm:text-sm">
          檔案將於指定期限後自動刪除。請勿上傳高度機密、敏感個資或未授權公開的文件。
        </p>
      </section>
    </main>
  );
}
