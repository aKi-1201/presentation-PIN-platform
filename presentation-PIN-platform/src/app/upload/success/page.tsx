import type { Metadata } from "next";
import Link from "next/link";
import { CopyButtons } from "@/components/CopyButtons";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

interface UploadSuccessPageProps {
  searchParams?: {
    code?: string;
    manageToken?: string;
    expiresAt?: string;
  };
}

export default function UploadSuccessPage({
  searchParams = {}
}: UploadSuccessPageProps) {
  const code = typeof searchParams.code === "string" ? searchParams.code : "";
  const manageToken =
    typeof searchParams.manageToken === "string" ? searchParams.manageToken : "";
  const expiresAt =
    typeof searchParams.expiresAt === "string" ? searchParams.expiresAt : "";
  const viewUrl = code ? `/p/${code}` : "#";
  const manageUrl = manageToken ? `/manage/${manageToken}` : "#";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">上傳成功</h1>
        <p className="text-sm text-slate-600">管理連結僅顯示一次，請務必儲存。</p>
      </header>

      <section className="rounded-lg border p-6">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-500">簡報代碼</div>
            <div className="text-3xl font-bold tracking-widest">{code || "------"}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">觀看連結</div>
            <Link className="text-blue-600 underline" href={viewUrl}>
              {viewUrl}
            </Link>
          </div>
          <div>
            <div className="text-sm text-slate-500">管理連結</div>
            <Link className="text-blue-600 underline" href={manageUrl}>
              {manageUrl}
            </Link>
          </div>
          <div>
            <div className="text-sm text-slate-500">到期時間</div>
            <div>{expiresAt || "-"}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <CopyButtons code={code} viewUrl={viewUrl} manageUrl={manageUrl} />
        <Link className="rounded border px-4 py-2" href={viewUrl}>
          開啟簡報
        </Link>
        <Link className="rounded border px-4 py-2" href={manageUrl}>
          前往管理頁
        </Link>
      </section>
    </main>
  );
}
