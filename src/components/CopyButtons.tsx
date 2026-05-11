"use client";

import toast from "react-hot-toast";

interface CopyButtonsProps {
  code: string;
  viewUrl?: string;
  layout?: "inline" | "stacked";
  primaryLabel?: string;
  secondaryLabel?: string;
  showSecondary?: boolean;
  primaryClassName?: string;
  secondaryClassName?: string;
  containerClassName?: string;
}

export function CopyButtons({
  code,
  viewUrl = "",
  layout = "inline",
  primaryLabel = "複製代碼",
  secondaryLabel = "複製觀看連結",
  showSecondary = true,
  primaryClassName,
  secondaryClassName,
  containerClassName
}: CopyButtonsProps) {
  const isStacked = layout === "stacked";
  const wrapperClassName = containerClassName ?? (isStacked ? "space-y-3" : "space-y-2");
  const buttonGroupClassName = isStacked ? "flex flex-col gap-3" : "flex flex-wrap gap-3";
  const defaultPrimaryClassName = isStacked
    ? "w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
    : "rounded border px-4 py-2";
  const defaultSecondaryClassName = isStacked
    ? "w-full rounded-xl border border-slate-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
    : "rounded border px-4 py-2";
  const canCopyCode = Boolean(code);
  const canCopyViewUrl = Boolean(viewUrl) && viewUrl !== "#";
  const shouldShowSecondary = showSecondary;

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已複製到剪貼簿！");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "複製失敗";
      toast.error(message);
    }
  };

  return (
    <div className={wrapperClassName}>
      <div className={buttonGroupClassName}>
        <button
          className={primaryClassName ?? defaultPrimaryClassName}
          type="button"
          onClick={() => copyText(code)}
          disabled={!canCopyCode}
        >
          {primaryLabel}
        </button>
        {shouldShowSecondary && (
          <button
            className={secondaryClassName ?? defaultSecondaryClassName}
            type="button"
            onClick={() => copyText(viewUrl)}
            disabled={!canCopyViewUrl}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
