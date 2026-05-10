"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CodeInput() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGo = () => {
    const normalized = code.trim().toUpperCase();

    if (normalized.length !== 6) {
      setError("請輸入 6 位代碼");
      return;
    }

    setError(null);
    router.push(`/p/${normalized}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">簡報代碼</label>
        <input
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          type="text"
          value={code}
          maxLength={6}
          placeholder="輸入 6 位代碼"
          autoComplete="off"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        type="button"
        onClick={handleGo}
      >
        開始簡報
      </button>
    </div>
  );
}
