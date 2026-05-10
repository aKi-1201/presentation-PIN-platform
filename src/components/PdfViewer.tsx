"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

interface PdfViewerProps {
  code: string;
}

const getWorkerSrc = () => {
  const version = pdfjs.version ?? "4.0.0";
  const major = Number.parseInt(version.split(".")[0] ?? "0", 10);
  const extension = Number.isFinite(major) && major >= 4 ? "mjs" : "js";

  return `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.${extension}`;
};

const DEFAULT_SCALE = 1.5;
type PdfRenderTask = ReturnType<PDFPageProxy["render"]>;

export function PdfViewer({ code }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);

  useEffect(() => {
    let canceled = false;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/api/presentations/${code}/file`;
        pdfjs.GlobalWorkerOptions.workerSrc = getWorkerSrc();
        const task = pdfjs.getDocument({ url });
        const pdf = await task.promise;

        if (canceled) {
          await pdf.destroy();
          return;
        }

        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setScale(DEFAULT_SCALE);
      } catch (error: unknown) {
        console.error(error);
        setError("載入失敗");
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      canceled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      void pdfRef.current?.destroy?.();
      pdfRef.current = null;
    };
  }, [code]);

  const updateScaleForFullscreen = useCallback(
    async (fullscreen: boolean) => {
      if (!fullscreen) {
        setScale(DEFAULT_SCALE);
        return;
      }

      if (!pdfRef.current) {
        return;
      }

      const page = await pdfRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1 });
      const availableHeight = Math.max(window.innerHeight - 100, 1);
      const heightScale = availableHeight / viewport.height;
      const widthScale = window.innerWidth / viewport.width;
      const newScale = Math.min(heightScale, widthScale);

      setScale(Number.isFinite(newScale) && newScale > 0 ? newScale : DEFAULT_SCALE);
    },
    [currentPage]
  );

  const renderPage = useCallback(async () => {
    if (!pdfRef.current || !canvasRef.current) {
      return;
    }

    const page = await pdfRef.current.getPage(currentPage);
    const currentScale = scale;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: currentScale * devicePixelRatio });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width / devicePixelRatio}px`;
    canvas.style.height = `${viewport.height / devicePixelRatio}px`;

    const renderTask = page.render({ canvasContext: context, viewport });
    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
    } catch (error: unknown) {
      if (typeof error === "object" && error && "name" in error) {
        if ((error as { name: string }).name !== "RenderingCancelledException") {
          console.error(error);
        }
      } else {
        console.error(error);
      }
    } finally {
      if (renderTaskRef.current === renderTask) {
        renderTaskRef.current = null;
      }
    }
  }, [currentPage, scale]);

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
      const fullscreen = Boolean(document.fullscreenElement);

      setIsFullscreen(fullscreen);
      void updateScaleForFullscreen(fullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [updateScaleForFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "flex flex-col items-center justify-center bg-black w-full h-full"
          : "flex min-h-screen flex-col items-center gap-4 p-6"
      }
      ref={containerRef}
    >
      <div
        className={
          isFullscreen
            ? "flex h-full w-full items-center justify-center bg-black"
            : "w-full max-w-5xl rounded bg-black/80 p-6"
        }
      >
        {loading && <p className="text-white">載入中...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && (
          <div
            className={`flex items-center justify-center text-white ${
              isFullscreen ? "h-full w-full" : "h-[70vh]"
            }`}
          >
            <canvas
              ref={canvasRef}
              className="object-contain max-h-[calc(100vh-100px)] max-w-full"
            />
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
