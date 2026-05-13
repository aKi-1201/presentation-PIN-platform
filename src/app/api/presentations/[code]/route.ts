import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { isPresentationAccessible } from "@/lib/presentation";
import type { ApiError, PresentationMetaResponse } from "@/types/presentation";

const paramsSchema = z.object({
  code: z.string().min(1).max(32)
});

const INVALID_CODE_ERROR: ApiError = { error: "代碼無效或已過期" };

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, "lookup")) {
      return NextResponse.json({ error: "請求過於頻繁" }, { status: 429 });
    }

    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: "參數錯誤" }, { status: 400 });
    }

    const code = parsed.data.code.toUpperCase();
    const presentation = await prisma.presentation.findUnique({
      where: { publicCode: code }
    });

    if (!presentation || !isPresentationAccessible(presentation)) {
      return NextResponse.json(INVALID_CODE_ERROR, { status: 404 });
    }

    const response: PresentationMetaResponse = {
      code,
      fileName: presentation.originalFilename,
      expiresAt: presentation.expiresAt.toISOString(),
      status: presentation.status as PresentationMetaResponse["status"]
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(INVALID_CODE_ERROR, { status: 404 });
  }
}
