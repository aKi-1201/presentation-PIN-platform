import crypto from "crypto";

const TOKEN_BYTES = 32;
const MANAGEMENT_TOKEN_SECRET = process.env.MANAGEMENT_TOKEN_SECRET ?? "";

// Use crypto.randomBytes(TOKEN_BYTES) to generate a secure token.
export function generateManagementToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

// Use HMAC SHA-256 + MANAGEMENT_TOKEN_SECRET to hash the token.
export function hashToken(token: string): string {
  if (!MANAGEMENT_TOKEN_SECRET) {
    throw new Error("MANAGEMENT_TOKEN_SECRET is not configured.");
  }

  return crypto
    .createHmac("sha256", MANAGEMENT_TOKEN_SECRET)
    .update(token)
    .digest("hex");
}

// Hash the input token and compare with the stored hash.
export function verifyToken(token: string, hash: string): boolean {
  try {
    const hashed = hashToken(token);
    const a = Buffer.from(hashed, "hex");
    const b = Buffer.from(hash, "hex");

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
