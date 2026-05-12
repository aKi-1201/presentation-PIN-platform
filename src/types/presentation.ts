export type PresentationStatus = "active" | "deleted";

export type RetentionOption = "24h" | "3d" | "7d";

export interface Presentation {
  id: string;
  publicCode: string;
  originalFilename: string;
  storagePath: string;
  fileSizeBytes: bigint;
  mimeType: string;
  status: PresentationStatus;
  expiresAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  viewCount: number;
  lastViewedAt: Date | null;
}

export interface UploadRequest {
  file: File;
  retention: RetentionOption;
}

export interface UploadResponse {
  code: string;
  viewUrl: string;
  expiresAt: string;
}

export interface PresentationMetaResponse {
  code: string;
  fileName: string;
  expiresAt: string;
  status: PresentationStatus;
}

export interface ApiError {
  error: string;
}
