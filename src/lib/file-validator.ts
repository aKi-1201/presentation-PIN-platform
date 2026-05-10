export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validation order:
// 1. File exists
// 2. File size <= MAX_UPLOAD_SIZE_MB
// 3. Extension is .pdf
// 4. MIME type is application/pdf
// 5. Magic bytes start with %PDF
export async function validatePdfFile(
  file: File,
  maxSizeMb: number
): Promise<ValidationResult> {
  if (!file) {
    return { valid: false, error: "缺少檔案" };
  }

  if (file.size === 0) {
    return { valid: false, error: "檔案為空" };
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (Number.isFinite(maxBytes) && file.size > maxBytes) {
    return { valid: false, error: "檔案過大" };
  }

  const filename = file.name?.toLowerCase() ?? "";
  if (!filename.endsWith(".pdf")) {
    return { valid: false, error: "檔案格式錯誤" };
  }

  if (file.type && file.type !== "application/pdf") {
    return { valid: false, error: "檔案格式錯誤" };
  }

  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const isPdfMagic =
    header.length >= 4 &&
    header[0] === 0x25 &&
    header[1] === 0x50 &&
    header[2] === 0x44 &&
    header[3] === 0x46;

  if (!isPdfMagic) {
    return { valid: false, error: "檔案格式錯誤" };
  }

  return { valid: true };
}
