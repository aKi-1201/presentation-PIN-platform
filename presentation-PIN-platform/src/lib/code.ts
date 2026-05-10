import crypto from "crypto";
import type { PrismaClient } from "@prisma/client";

export const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = Number(process.env.CODE_LENGTH ?? 6);

const MAX_ATTEMPTS = 20;

// Use crypto.randomInt to generate secure codes and ensure uniqueness in DB.
export async function generateUniqueCode(prisma: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    let code = "";

    for (let i = 0; i < CODE_LENGTH; i += 1) {
      const index = crypto.randomInt(0, CODE_CHARS.length);
      code += CODE_CHARS[index];
    }

    const existing = await prisma.presentation.findUnique({
      where: { publicCode: code }
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate a unique code.");
}
