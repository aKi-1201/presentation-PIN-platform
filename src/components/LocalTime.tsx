"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  expiresAt: string;
}

export function LocalTime({ expiresAt }: LocalTimeProps) {
  // 初始狀態先顯示載入中或橫線，避免 Next.js Hydration (水合) 報錯
  const [formattedTime, setFormattedTime] = useState("-");

  useEffect(() => {
    if (!expiresAt) return;

    const parsedDate = new Date(expiresAt);
    if (Number.isNaN(parsedDate.getTime())) return;

    // 💡 關鍵：因為這段程式碼是在「使用者的瀏覽器」上執行的
    // 所以我們不指定 timeZone，瀏覽器就會自動抓取該裝置的系統時區！
    const local = new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(parsedDate);

    setFormattedTime(local);
  }, [expiresAt]);

  return <span className="font-semibold text-slate-800">{formattedTime}</span>;
}