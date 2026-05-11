"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
    ? "w-full rounded-full border border-slate-200 bg-white px-5 py-4 text-center text-4xl font-semibold leading-none tracking-[0.5em] text-slate-900 shadow-lg shadow-slate-200/60 transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:py-5 sm:text-5xl lg:text-6xl"
    : "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70";
  const placeholderClassName = isHero
    ? "placeholder:text-2xl placeholder:tracking-[0.25em] placeholder:leading-none sm:placeholder:text-3xl lg:placeholder:text-4xl"
    : "";
  const errorInputClassName = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
    : "";
  const shakeClassName = isShaking ? "animate-shake" : "";
  const inputClassName = `${baseInputClassName} ${placeholderClassName} ${errorInputClassName} ${shakeClassName}`.trim();
  const errorClassName = isHero ? "text-center text-sm text-red-600" : "text-sm text-red-600";
  const buttonClassName = isHero
    ? "mx-auto inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
    : "inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800";

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
      </div>

      {error && (
        <p className={errorClassName} role="alert">
          {error}
        </p>
      )}

      <button
        className={buttonClassName}
        type="button"
        onClick={() => void handleGo()}
        disabled={isChecking}
        aria-busy={isChecking}
      >
        開始簡報
      </button>
    </div>
  );
}
