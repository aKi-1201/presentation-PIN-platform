import type { Metadata } from "next";
import Link from "next/link";
import { CopyButtons } from "@/components/CopyButtons";
import { Clock } from "lucide-react";
import { useMemo } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

interface UploadSuccessPageProps {
  searchParams?: {
    code?: string;
    expiresAt?: string;
  };
}

export default function UploadSuccessPage({
  searchParams = {}
}: UploadSuccessPageProps) {
  const code = typeof searchParams.code === "string" ? searchParams.code : "";
  const expiresAt =
    typeof searchParams.expiresAt === "string" ? searchParams.expiresAt : "";
  const viewUrl = code ? `/p/${code}` : "#";
  const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;
  const hasValidExpiresAt = Boolean(parsedExpiresAt && !Number.isNaN(parsedExpiresAt.getTime()));
  const formattedExpiresAt = useMemo(() => {
      if (!expiresAt) {
        return "-";
      }
  
      const parsedDate = new Date(expiresAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return "-";
      }
  
      return new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(parsedDate);
    }, [expiresAt]);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 px-6 py-12">
      <Link
        className="absolute top-6 left-6 z-50 text-2xl font-semibold uppercase tracking-[0.25em] text-slate-500 transition hover:text-slate-900"
        href="/"
      >
        Zlide
      </Link>
      <div className="w-full max-w-md">
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200/70 sm:p-8">
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Zlide</p>
            <h1 className="mt-3 text-xl font-semibold text-slate-900">上傳成功</h1>
            <p className="mt-2 text-sm text-slate-500">請先複製簡報代碼。</p>
          </header>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-500">簡報代碼</p>
            <div className="mt-2 text-6xl font-bold tracking-widest text-slate-900">
              {code || "------"}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <CopyButtons
              code={code}
              layout="stacked"
              primaryLabel="複製簡報代碼"
              showSecondary={false}
            />
            <Link
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-200"
              href={viewUrl}
            >
              預覽簡報
            </Link>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Clock size={14} className="text-slate-400" aria-hidden="true" />
              <span>到期時間：</span>
              <span className="font-semibold text-slate-800">{formattedExpiresAt}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">此簡報將於上述時間自動銷毀。</div>
          </div>
        </section>
      </div>
    </main>
  );
}
