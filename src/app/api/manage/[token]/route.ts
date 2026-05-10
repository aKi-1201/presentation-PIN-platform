import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/token";
import { deletePdf } from "@/lib/storage";
import type { ApiError, ManageResponse } from "@/types/presentation";

const paramsSchema = z.object({
  token: z.string().min(1).max(128)
});

const INVALID_TOKEN_ERROR: ApiError = { error: "管理連結無效" };

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    void request;
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(INVALID_TOKEN_ERROR, { status: 404 });
    }

    const managementTokenHash = hashToken(parsed.data.token);
    const presentation = await prisma.presentation.findFirst({
      where: { managementTokenHash }
    });

    if (!presentation) {
      return NextResponse.json(INVALID_TOKEN_ERROR, { status: 404 });
    }

    const response: ManageResponse = {
      code: presentation.publicCode,
      fileName: presentation.originalFilename,
      expiresAt: presentation.expiresAt.toISOString(),
      status: presentation.status as "active" | "deleted",
      viewCount: presentation.viewCount
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(INVALID_TOKEN_ERROR, { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    void request;
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(INVALID_TOKEN_ERROR, { status: 404 });
    }

    const managementTokenHash = hashToken(parsed.data.token);
    const presentation = await prisma.presentation.findFirst({
      where: { managementTokenHash }
    });

    if (!presentation) {
      return NextResponse.json(INVALID_TOKEN_ERROR, { status: 404 });
    }

    await deletePdf(presentation.storagePath);

    await prisma.presentation.update({
      where: { id: presentation.id },
      data: {
        status: "deleted",
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ status: "deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(INVALID_TOKEN_ERROR, { status: 404 });
  }
}
