export type RateLimitAction = "upload" | "lookup" | "file";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const LIMITS: Record<RateLimitAction, { limit: number; windowMs: number }> = {
  upload: { limit: 5, windowMs: 60 * 1000 },
  lookup: { limit: 30, windowMs: 60 * 1000 },
  file: { limit: 60, windowMs: 60 * 1000 }
};

const buckets = new Map<string, RateLimitBucket>();

// Prototype in-memory rate limit (single instance only).
export function checkRateLimit(ip: string, action: RateLimitAction): boolean {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const config = LIMITS[action];
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (bucket.count >= config.limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}
