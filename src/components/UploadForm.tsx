"use client";

import { useState } from "react";
import type { RetentionOption, UploadResponse } from "@/types/presentation";

interface UploadFormProps {
  onSuccess: (result: UploadResponse) => void;
}

const RETENTION_OPTIONS: { label: string; value: RetentionOption }[] = [
  { label: "1 小時", value: "1h" },
  { label: "24 小時", value: "24h" },
  { label: "3 天", value: "3d" },
  { label: "7 天", value: "7d" }
];

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [retention, setRetention] = useState<RetentionOption>("7d");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setUploading(true);

    try {
      if (!file) {
        setError("請選擇 PDF 檔案");
        return;
      }

      const formData = new FormData();
      formData.set("file", file);
      formData.set("retention", retention);

      const response = await fetch("/api/presentations", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "上傳失敗，請稍後再試");
        return;
      }

      onSuccess(data as UploadResponse);
    } catch (err: unknown) {
      setError("上傳失敗，請稍後再試");
      void err;
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium">PDF 檔案</label>
        <input
          className="w-full rounded border px-3 py-2"
          type="file"
          accept=".pdf,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">保存期限</label>
        <select
          className="w-full rounded border px-3 py-2"
          value={retention}
          onChange={(event) => setRetention(event.target.value as RetentionOption)}
        >
          {RETENTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        className="rounded border px-4 py-2"
        type="submit"
        disabled={uploading}
      >
        {uploading ? "上傳中..." : "開始上傳"}
      </button>
    </form>
  );
}
