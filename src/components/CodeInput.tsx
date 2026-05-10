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
        <label className="block text-sm font-medium">簡報代碼</label>
        <input
          className="w-full rounded border px-3 py-2 tracking-widest"
          type="text"
          value={code}
          maxLength={6}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="rounded border px-4 py-2" type="button" onClick={handleGo}>
        開始簡報
      </button>
    </div>
  );
}
