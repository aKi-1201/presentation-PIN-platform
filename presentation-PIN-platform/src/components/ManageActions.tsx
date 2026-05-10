"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PresentationStatus } from "@/types/presentation";

interface ManageActionsProps {
  token: string;
  initialStatus: PresentationStatus;
}

export function ManageActions({ token, initialStatus }: ManageActionsProps) {
  const [status, setStatus] = useState<PresentationStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (status === "deleted") {
      return;
    }

    const confirmed = window.confirm("確定要刪除此簡報嗎？刪除後代碼將立即失效。");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/manage/${token}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "刪除失敗");
        return;
      }

      setStatus("deleted");
      router.refresh();
    } catch (err: unknown) {
      setError("刪除失敗");
      void err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-2">
      <button
        className="rounded border px-4 py-2"
        type="button"
        disabled={loading || status === "deleted"}
        onClick={handleDelete}
      >
        {status === "deleted" ? "已刪除" : loading ? "刪除中..." : "刪除簡報"}
      </button>
      {status === "deleted" && (
        <p className="text-sm text-red-600">此簡報已刪除，原代碼已失效。</p>
      )}
      {status !== "deleted" && (
        <p className="text-sm text-red-600">刪除前請確認，刪除後代碼立即失效。</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
