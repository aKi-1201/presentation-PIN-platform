import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePdfFile } from "@/lib/file-validator";
import { generateUniqueCode } from "@/lib/code";
import { generateManagementToken, hashToken } from "@/lib/token";
import { calculateExpiresAt } from "@/lib/retention";
import { savePdf } from "@/lib/storage";
import type { ApiError, UploadResponse } from "@/types/presentation";

const retentionSchema = z.object({
  retention: z.enum(["1h", "24h", "3d", "7d"])
});

const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "20");

export const runtime = "nodejs";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, "upload")) {
      return NextResponse.json({ error: "請求過於頻繁" }, { status: 429 });
    }

    const form = await request.formData();
    const retentionValue = form.get("retention");
    const file = form.get("file");

    if (typeof retentionValue !== "string") {
      return NextResponse.json({ error: "缺少參數" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "缺少檔案" }, { status: 400 });
    }

    const retentionResult = retentionSchema.safeParse({ retention: retentionValue });
    if (!retentionResult.success) {
      return NextResponse.json({ error: "保存期限無效" }, { status: 400 });
    }

    const validation = await validatePdfFile(file, MAX_UPLOAD_SIZE_MB);
    if (!validation.valid) {
      const status = validation.error === "檔案過大" ? 413 : 400;
      return NextResponse.json(
        { error: validation.error ?? "檔案格式錯誤" },
        { status }
      );
    }

    const publicCode = await generateUniqueCode(prisma);
    const managementToken = generateManagementToken();
    const managementTokenHash = hashToken(managementToken);
    const expiresAt = calculateExpiresAt(retentionResult.data.retention);
    const presentationId = crypto.randomUUID();
    const storagePath = await savePdf(file, presentationId);

    await prisma.presentation.create({
      data: {
        id: presentationId,
        publicCode,
        managementTokenHash,
        originalFilename: file.name,
        storagePath,
        fileSizeBytes: BigInt(file.size),
        mimeType: file.type || "application/pdf",
        status: "active",
        expiresAt
      }
    });

    const response: UploadResponse = {
      code: publicCode,
      viewUrl: `/p/${publicCode}`,
      manageUrl: `/manage/${managementToken}`,
      expiresAt: expiresAt.toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    const error: ApiError = { error: "伺服器錯誤" };
    return NextResponse.json(error, { status: 500 });
  }
}
