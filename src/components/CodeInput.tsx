"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface CodeInputProps {
  variant?: "default" | "hero";
  autoFocus?: boolean;
}

export function CodeInput({ variant = "default", autoFocus = false }: CodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const isHero = variant === "hero";

  const containerClassName = isHero ? "w-full space-y-6" : "space-y-4";
  const labelClassName = isHero ? "sr-only" : "block text-sm font-medium text-slate-700";
  const baseInputClassName = isHero
    ? "w-full rounded-full border-2 border-slate-200 bg-white px-14 pt-3 pb-4 leading-none text-center text-3xl font-semibold tracking-[0.4em] text-slate-900 outline-none transition-all focus:border-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-70"
    : "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70";
  const placeholderClassName = isHero
    ? "placeholder:text-xl placeholder:tracking-[0.3em]"
    : "";
  const errorInputClassName = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
    : "";
  const shakeClassName = isShaking ? "animate-shake" : "";
  const inputClassName = `${baseInputClassName} ${placeholderClassName} ${errorInputClassName} ${shakeClassName}`.trim();
  const errorClassName = isHero ? "text-center text-sm text-red-600" : "text-sm text-red-600";
  const buttonClassName =
    "inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800";

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  const triggerError = (message: string) => {
    setError(message);
    setIsShaking(false);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    requestAnimationFrame(() => {
      setIsShaking(true);
      shakeTimeoutRef.current = window.setTimeout(() => {
        setIsShaking(false);
      }, 450);
    });
  };

  const handleGo = async () => {
    if (isChecking) {
      return;
    }

    const normalized = code.trim().toUpperCase();

    if (normalized.length !== 6) {
      triggerError("請輸入 6 位代碼");
      return;
    }

    setError(null);
    setIsChecking(true);

    try {
      const response = await fetch(`/api/presentations/${normalized}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        triggerError("代碼無效或已過期");
        return;
      }

      router.push(`/p/${normalized}`);
    } catch (error: unknown) {
      void error;
      triggerError("代碼無效或已過期");
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCode(sanitized);
    if (error) {
      setError(null);
      setIsShaking(false);
    }
  };

  return (
    <div className={containerClassName}>
      <div className="space-y-2">
        <label className={labelClassName}>簡報代碼</label>
        <div className={isHero ? "relative" : ""}>
          <input
            className={inputClassName}
            type="text"
            value={code}
            maxLength={6}
            placeholder="輸入 6 位代碼"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-invalid={Boolean(error)}
            disabled={isChecking}
            onChange={handleChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void handleGo();
              }
            }}
          />
          {isHero && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 p-2 text-white shadow-sm transition-transform hover:bg-slate-800 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void handleGo()}
              disabled={isChecking}
              aria-label="開始簡報"
            >
              <ArrowRight size={24} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className={errorClassName} role="alert">
          {error}
        </p>
      )}

      {!isHero && (
        <button
          className={buttonClassName}
          type="button"
          onClick={() => void handleGo()}
          disabled={isChecking}
          aria-busy={isChecking}
        >
          開始簡報
        </button>
      )}
    </div>
  );
}
