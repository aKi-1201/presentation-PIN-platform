import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/data/uploads";

// Ensure UPLOAD_DIR exists.
export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// Save PDF to /data/uploads/{presentationId}.pdf
// Return storagePath (relative or absolute).
export async function savePdf(file: File, presentationId: string): Promise<string> {
  await ensureUploadDir();

  const filename = `${presentationId}.pdf`;
  const storagePath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(storagePath, buffer);
  return filename;
}

// Delete PDF, ignore missing file errors.
export async function deletePdf(storagePath: string): Promise<void> {
  const absolutePath = resolveStoragePath(storagePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        return;
      }
    }

    throw error;
  }
}

// Resolve storagePath to an absolute path (for streaming).
export function resolveStoragePath(storagePath: string): string {
  if (path.isAbsolute(storagePath)) {
    return storagePath;
  }

  return path.resolve(UPLOAD_DIR, storagePath);
}
