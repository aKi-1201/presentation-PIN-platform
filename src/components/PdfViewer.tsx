"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";

interface PdfViewerProps {
  code: string;
}

const WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";

export function PdfViewer({ code }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let canceled = false;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        GlobalWorkerOptions.workerSrc = WORKER_SRC;
        const response = await fetch(`/api/presentations/${code}/file`);

        if (!response.ok) {
          setError("代碼無效或已過期");
          return;
        }

        const buffer = await response.arrayBuffer();
        const task = getDocument({ data: buffer });
        const pdf = await task.promise;

        if (canceled) {
          await pdf.destroy();
          return;
        }

        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err: unknown) {
        setError("載入失敗");
        void err;
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      canceled = true;
      void pdfRef.current?.destroy?.();
      pdfRef.current = null;
    };
  }, [code]);

  const renderPage = useCallback(async () => {
    if (!pdfRef.current || !canvasRef.current) {
      return;
    }

    const page = await pdfRef.current.getPage(currentPage);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
  }, [currentPage]);

  useEffect(() => {
    if (!loading && !error && pdfRef.current) {
      void renderPage();
    }
  }, [loading, error, renderPage]);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => {
      if (!totalPages) {
        return prev + 1;
      }
      return Math.min(prev + 1, totalPages);
    });
  }, [totalPages]);

  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
      if (event.key.toLowerCase() === "f") {
        handleToggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleToggleFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center gap-4 p-6"
      ref={containerRef}
    >
      <div className="w-full max-w-5xl rounded bg-black/80 p-6">
        {loading && <p className="text-white">載入中...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && (
          <div className="flex h-[70vh] items-center justify-center text-white">
            <canvas ref={canvasRef} className="max-h-full max-w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-white">
        <button className="rounded border px-4 py-2" type="button" onClick={handlePrev}>
          上一頁
        </button>
        <span>
          {currentPage} / {totalPages ?? "-"}
        </span>
        <button className="rounded border px-4 py-2" type="button" onClick={handleNext}>
          下一頁
        </button>
        <button
          className="rounded border px-4 py-2"
          type="button"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? "退出全螢幕" : "全螢幕"}
        </button>
      </div>
    </div>
  );
}
