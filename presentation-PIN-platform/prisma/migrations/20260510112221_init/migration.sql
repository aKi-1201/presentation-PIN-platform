-- CreateTable
CREATE TABLE "presentations" (
    "id" UUID NOT NULL,
    "public_code" TEXT NOT NULL,
    "management_token_hash" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "last_viewed_at" TIMESTAMP(3),

    CONSTRAINT "presentations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "presentations_public_code_key" ON "presentations"("public_code");

-- CreateIndex
CREATE INDEX "presentations_public_code_idx" ON "presentations"("public_code");

-- CreateIndex
CREATE INDEX "presentations_expires_at_idx" ON "presentations"("expires_at");

-- CreateIndex
CREATE INDEX "presentations_status_idx" ON "presentations"("status");
