"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent, type WheelEvent } from "react";
import Link from "next/link";
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
const THUMBNAIL_SCALE = 0.25;
const THUMBNAIL_HEIGHT = 96;
const CONTROLS_REVEAL_ZONE_PX = 10;
type PdfRenderTask = ReturnType<PDFPageProxy["render"]>;

export function PdfViewer({ code }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const thumbnailRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const thumbnailButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const thumbnailRenderTasksRef = useRef<Map<number, PdfRenderTask>>(new Map());
  const renderedThumbnailsRef = useRef<Set<number>>(new Set());

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
        renderedThumbnailsRef.current.clear();
        thumbnailRenderTasksRef.current.forEach((task) => task.cancel());
        thumbnailRenderTasksRef.current.clear();
        thumbnailButtonRefs.current.clear();
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
      thumbnailRenderTasksRef.current.forEach((task) => task.cancel());
      thumbnailRenderTasksRef.current.clear();
      renderedThumbnailsRef.current.clear();
      thumbnailRefs.current.clear();
      thumbnailButtonRefs.current.clear();
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
      const availableHeight = Math.max(window.innerHeight, 1);
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

  const renderThumbnail = useCallback(async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdfRef.current || renderedThumbnailsRef.current.has(pageNumber)) {
      return;
    }

    if (thumbnailRenderTasksRef.current.has(pageNumber)) {
      thumbnailRenderTasksRef.current.get(pageNumber)?.cancel();
      thumbnailRenderTasksRef.current.delete(pageNumber);
    }

    const page = await pdfRef.current.getPage(pageNumber);
    const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const cssWidth = (viewport.width / viewport.height) * THUMBNAIL_HEIGHT;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${THUMBNAIL_HEIGHT}px`;

    const renderTask = page.render({ canvasContext: context, viewport });
    thumbnailRenderTasksRef.current.set(pageNumber, renderTask);

    try {
      await renderTask.promise;
      renderedThumbnailsRef.current.add(pageNumber);
    } catch (error: unknown) {
      if (typeof error === "object" && error && "name" in error) {
        if ((error as { name: string }).name !== "RenderingCancelledException") {
          console.error(error);
        }
      } else {
        console.error(error);
      }
    } finally {
      if (thumbnailRenderTasksRef.current.get(pageNumber) === renderTask) {
        thumbnailRenderTasksRef.current.delete(pageNumber);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !error && pdfRef.current) {
      void renderPage();
    }
  }, [loading, error, renderPage]);

  useEffect(() => {
    if (loading || error || !pdfRef.current || !totalPages || isFullscreen) {
      return;
    }

    let canceled = false;

    const renderThumbnails = async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        if (canceled) {
          return;
        }

        const canvas = thumbnailRefs.current.get(pageNumber);
        if (!canvas) {
          continue;
        }

        if (!renderedThumbnailsRef.current.has(pageNumber)) {
          await renderThumbnail(pageNumber, canvas);
        }
      }
    };

    void renderThumbnails();

    return () => {
      canceled = true;
    };
  }, [loading, error, totalPages, isFullscreen, renderThumbnail]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (!totalPages) {
        return prev + 1;
      }
      return Math.min(prev + 1, totalPages);
    });
  }, [totalPages]);

  const setThumbnailRef = useCallback(
    (pageNumber: number) => (node: HTMLCanvasElement | null) => {
      if (node) {
        thumbnailRefs.current.set(pageNumber, node);
        renderedThumbnailsRef.current.delete(pageNumber);

        if (!loading && !error && pdfRef.current && !isFullscreen) {
          void renderThumbnail(pageNumber, node);
        }

        return;
      }

      thumbnailRefs.current.delete(pageNumber);
      renderedThumbnailsRef.current.delete(pageNumber);

      const task = thumbnailRenderTasksRef.current.get(pageNumber);
      if (task) {
        task.cancel();
        thumbnailRenderTasksRef.current.delete(pageNumber);
      }
    },
    [renderThumbnail, loading, error, isFullscreen]
  );

  const setThumbnailButtonRef = useCallback(
    (pageNumber: number) => (node: HTMLButtonElement | null) => {
      if (node) {
        thumbnailButtonRefs.current.set(pageNumber, node);
        return;
      }

      thumbnailButtonRefs.current.delete(pageNumber);
    },
    []
  );

  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const scheduleHideControls = useCallback(() => {
    if (!isFullscreen) {
      return;
    }

    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }

    setControlsVisible(true);
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2500);
  }, [isFullscreen]);

  const handlePointerMove = useCallback(
    (event: { clientY: number }) => {
      if (!isFullscreen) {
        return;
      }

      if (event.clientY < window.innerHeight - CONTROLS_REVEAL_ZONE_PX) {
        return;
      }

      scheduleHideControls();
    },
    [isFullscreen, scheduleHideControls]
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 0) {
        return;
      }

      handlePointerMove({ clientY: event.touches[0]?.clientY ?? 0 });
    },
    [handlePointerMove]
  );

  const handleThumbnailWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (isFullscreen) {
        return;
      }

      const { deltaX, deltaY } = event;
      if (Math.abs(deltaY) <= Math.abs(deltaX)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (deltaY > 0) {
        goToNextPage();
        return;
      }

      if (deltaY < 0) {
        handlePrev();
      }
    },
    [goToNextPage, handlePrev, isFullscreen]
  );

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
      if (isFullscreen) {
        scheduleHideControls();
      }

      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goToNextPage();
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
  }, [goToNextPage, handlePrev, handleToggleFullscreen, isFullscreen, scheduleHideControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = Boolean(document.fullscreenElement);

      setIsFullscreen(fullscreen);
      void updateScaleForFullscreen(fullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [updateScaleForFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true);

      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = null;
      }

      return;
    }

    scheduleHideControls();

    return () => {
      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = null;
      }
    };
  }, [isFullscreen, scheduleHideControls]);

  useEffect(() => {
    if (isFullscreen || !filmstripRef.current) {
      return;
    }

    const target = thumbnailButtonRefs.current.get(currentPage);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentPage, isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "relative flex flex-col items-center justify-center bg-black w-full h-full"
          : "relative flex min-h-screen flex-col items-center gap-4 p-6"
      }
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onTouchStart={handleTouchStart}
    >
      <Link
        className={`absolute top-6 left-6 z-50 text-xl font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:text-white ${
          isFullscreen ? "hidden" : "block"
        }`}
        href="/"
      >
        ZLIDE
      </Link>
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
          <>
            <div
              className={`flex items-center justify-center text-white ${
                isFullscreen ? "h-full w-full" : "h-[70vh]"
              }`}
              onClick={goToNextPage}
            >
              <canvas
                ref={canvasRef}
                className={`object-contain max-w-full ${
                  isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-100px)]"
                }`}
              />
            </div>
            {!isFullscreen && totalPages && (
              <div
                className="flex w-full gap-4 overflow-x-auto px-2 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onWheel={handleThumbnailWheel}
                ref={filmstripRef}
              >
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === currentPage;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      ref={setThumbnailButtonRef(pageNumber)}
                      className={
                        isActive
                          ? "opacity-100 ring-2 ring-white ring-offset-2 ring-offset-black"
                          : "opacity-40 transition-all hover:opacity-100"
                      }
                    >
                      <canvas
                        ref={setThumbnailRef(pageNumber)}
                        className="h-24 object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={`absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full px-6 py-3 text-white/90 backdrop-blur-md transition-opacity ${
          isFullscreen
            ? "border border-white/20 bg-black/60 shadow-lg shadow-black/40"
            : "border border-white/10 bg-white/10"
        } ${isFullscreen && !controlsVisible ? "pointer-events-none opacity-0" : "opacity-100"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="rounded-full px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
          type="button"
          onClick={handlePrev}
        >
          上一頁
        </button>
        <span className="text-sm font-medium text-white/80">
          {currentPage} / {totalPages ?? "-"}
        </span>
        <button
          className="rounded-full px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
          type="button"
          onClick={goToNextPage}
        >
          下一頁
        </button>
        <button
          className="rounded-full px-4 py-2 text-sm text-white transition-all hover:bg-white/20"
          type="button"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? "退出全螢幕" : "全螢幕"}
        </button>
      </div>
    </div>
  );
}
