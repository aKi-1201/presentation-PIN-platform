import type { RetentionOption } from "@/types/presentation";

const RETENTION_OPTIONS: RetentionOption[] = ["1h", "24h", "3d", "7d"];

// Validate retention value.
export function isValidRetention(value: string): value is RetentionOption {
  return RETENTION_OPTIONS.includes(value as RetentionOption);
}

// Calculate expiresAt by retention value.
export function calculateExpiresAt(retention: RetentionOption): Date {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  switch (retention) {
    case "1h":
      return new Date(now + hour);
    case "24h":
      return new Date(now + 24 * hour);
    case "3d":
      return new Date(now + 3 * day);
    case "7d":
      return new Date(now + 7 * day);
    default:
      return new Date(now + 7 * day);
  }
}
