import type { Metadata } from "next";
import type { ManageResponse } from "@/types/presentation";
import { headers } from "next/headers";
import { ManageActions } from "@/components/ManageActions";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

interface ManagePageProps {
  params: {
    token: string;
  };
}

export default async function ManagePage({ params }: ManagePageProps) {
  const token = params.token;
  const headerList = headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = host
    ? `${proto}://${host}`
    : (process.env.APP_URL ?? "http://localhost:3000");

  const response = await fetch(`${baseUrl}/api/manage/${token}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">管理連結無效</h1>
      </main>
    );
  }

  const data = (await response.json()) as ManageResponse;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">管理簡報</h1>
        <p className="text-sm text-slate-600">管理連結無法重新產生，請妥善保存。</p>
      </header>

      <section className="rounded-lg border p-6">
        <div className="space-y-2">
          <div>
            <div className="text-sm text-slate-500">原始檔名</div>
            <div>{data.fileName}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">到期時間</div>
            <div>{data.expiresAt}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">狀態</div>
            <div>{data.status}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">觀看次數</div>
            <div>{data.viewCount}</div>
          </div>
        </div>
      </section>

      <ManageActions token={token} initialStatus={data.status} />

    </main>
  );
}
