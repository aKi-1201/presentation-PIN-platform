"use client";

import { useState } from "react";

interface CopyButtonsProps {
  code: string;
  viewUrl: string;
  manageUrl: string;
}

export function CopyButtons({ code, viewUrl, manageUrl }: CopyButtonsProps) {
  const [message, setMessage] = useState<string | null>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("已複製");
      setTimeout(() => setMessage(null), 1500);
    } catch {
      setMessage("複製失敗");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <button className="rounded border px-4 py-2" type="button" onClick={() => copyText(code)}>
          複製代碼
        </button>
        <button
          className="rounded border px-4 py-2"
          type="button"
          onClick={() => copyText(viewUrl)}
        >
          複製觀看連結
        </button>
        <button
          className="rounded border px-4 py-2"
          type="button"
          onClick={() => copyText(manageUrl)}
        >
          複製管理連結
        </button>
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
