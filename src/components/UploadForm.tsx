"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { RetentionOption, UploadResponse } from "@/types/presentation";
import { Upload } from "lucide-react";

interface UploadFormProps {
  onSuccess: (result: UploadResponse) => void;
  isDragging?: boolean;
}

export type UploadFormHandle = {
  handleExternalFile: (file: File) => void;
};

const RETENTION_OPTIONS: { label: string; value: RetentionOption }[] = [
  { label: "24 小時", value: "24h" },
  { label: "3 天", value: "3d" },
  { label: "7 天", value: "7d" }
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const UploadForm = forwardRef<UploadFormHandle, UploadFormProps>(
  ({ onSuccess, isDragging = false }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [retention, setRetention] = useState<RetentionOption>("3d");
    const [uploading, setUploading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileError = (selectedFile: File | null) => {
      if (!selectedFile) {
        return "請選擇 PDF 檔案";
      }
      const isPdfType = selectedFile.type === "application/pdf";
      const isPdfName = selectedFile.name.toLowerCase().endsWith(".pdf");
      if (!isPdfType && !isPdfName) {
        return "僅支援 PDF 檔案";
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        return "檔案超過 20MB，請重新選擇";
      }
      return null;
    };

    const applySelectedFile = (selectedFile: File | null) => {
      if (!selectedFile) {
        setFile(null);
        setFileError(null);
        return;
      }

      const nextFileError = getFileError(selectedFile);
      if (nextFileError) {
        setFile(null);
        setFileError(nextFileError);
        setSubmitError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setFile(selectedFile);
      setFileError(null);
      setSubmitError(null);
    };

    useImperativeHandle(ref, () => ({
      handleExternalFile: (selectedFile: File) => {
        applySelectedFile(selectedFile);
      }
    }));

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] ?? null;
      applySelectedFile(selectedFile);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextFileError = getFileError(file);
      if (nextFileError) {
        setFileError(nextFileError);
        return;
      }

      if (!file) {
        setFileError("請選擇 PDF 檔案");
        return;
      }

      setSubmitError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("retention", retention);

        const response = await fetch("/api/presentations", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          setSubmitError(data?.error ?? "上傳失敗，請稍後再試");
          return;
        }

        onSuccess(data as UploadResponse);
      } catch (err: unknown) {
        setSubmitError("上傳失敗，請稍後再試");
        void err;
      } finally {
        setUploading(false);
      }
    };

    const errorMessage = fileError ?? submitError;
    const selectedFileLabel = file
      ? `${file.name}（${(file.size / 1024 / 1024).toFixed(1)} MB）`
      : null;
    const hasSelectedFile = Boolean(file);
    const dropzoneClassName = `flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center transition-all hover:border-slate-400 hover:bg-slate-50 ${
      isDragging ? "border-blue-500 bg-blue-50" : ""
    } ${uploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`.trim();

    const handleClearFile = () => {
      setFile(null);
      setFileError(null);
      setSubmitError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleDropzoneClick = () => {
      if (uploading) {
        return;
      }
      fileInputRef.current?.click();
    };

    const handleDropzoneKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (uploading) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    };

    const handleReplaceFile = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      fileInputRef.current?.click();
    };

    const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleClearFile();
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label className="sr-only" htmlFor="upload-file">
            PDF 檔案
          </label>
          <div
            className={dropzoneClassName}
            role="button"
            tabIndex={0}
            aria-disabled={uploading}
            onClick={handleDropzoneClick}
            onKeyDown={handleDropzoneKeyDown}
          >
            <Upload className="h-6 w-6 text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-600">點擊或拖曳 PDF 簡報至此</p>
            <p className="text-xs text-slate-400">僅限 PDF，檔案大小上限 20MB。</p>
            {hasSelectedFile && (
              <div className="mt-4 w-full max-w-md rounded-xl bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
                <span className="block truncate">已選擇：{selectedFileLabel}</span>
                <div className="mt-3 flex flex-wrap justify-center gap-4">
                  <button
                    className="text-xs font-semibold text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={handleReplaceFile}
                    disabled={uploading}
                  >
                    更換檔案
                  </button>
                  <button
                    className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={uploading}
                  >
                    移除
                  </button>
                </div>
              </div>
            )}
          </div>
          <input
            className="sr-only"
            id="upload-file"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">保存期限</label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            value={retention}
            onChange={(event) => setRetention(event.target.value as RetentionOption)}
            disabled={uploading}
          >
            {RETENTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={uploading}
          aria-busy={uploading}
        >
          {uploading && (
            <span
              className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
              aria-hidden="true"
            />
          )}
          {uploading ? "上傳中..." : "開始上傳"}
        </button>
      </form>
    );
  }
);

UploadForm.displayName = "UploadForm";
