import fs from "fs";
import fsPromises from "fs/promises";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { isPresentationAccessible } from "@/lib/presentation";
import { resolveStoragePath } from "@/lib/storage";
import type { ApiError } from "@/types/presentation";

const paramsSchema = z.object({
  code: z.string().min(1).max(32)
});

const INVALID_CODE_ERROR: ApiError = { error: "代碼無效或已過期" };

export const runtime = "nodejs";

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
    if (!checkRateLimit(ip, "file")) {
      return NextResponse.json({ error: "請求過於頻繁" }, { status: 429 });
    }

    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(INVALID_CODE_ERROR, { status: 404 });
    }

    const code = parsed.data.code.toUpperCase();
    const presentation = await prisma.presentation.findUnique({
      where: { publicCode: code }
    });

    if (!presentation || !isPresentationAccessible(presentation)) {
      return NextResponse.json(INVALID_CODE_ERROR, { status: 404 });
    }

    const absolutePath = resolveStoragePath(presentation.storagePath);

    let stat;
    try {
      stat = await fsPromises.stat(absolutePath);
    } catch {
      return NextResponse.json(INVALID_CODE_ERROR, { status: 404 });
    }

    const fileStream = fs.createReadStream(absolutePath);
    const stream = Readable.toWeb(fileStream) as ReadableStream;

    void prisma.presentation
      .update({
        where: { id: presentation.id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date()
        }
      })
      .catch(() => undefined);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Content-Length": stat.size.toString(),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(INVALID_CODE_ERROR, { status: 404 });
  }
}
