-- CreateEnum
CREATE TYPE "public"."PembayaranStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."pembayaran" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "start_month" TIMESTAMP(3) NOT NULL,
    "end_month" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_mime_type" TEXT NOT NULL,
    "status" "public"."PembayaranStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "rejection_reason" TEXT,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pembayaran_siswa_id_idx" ON "public"."pembayaran"("siswa_id");

-- CreateIndex
CREATE INDEX "pembayaran_status_idx" ON "public"."pembayaran"("status");

-- CreateIndex
CREATE INDEX "pembayaran_created_at_idx" ON "public"."pembayaran"("created_at");

-- AddForeignKey
ALTER TABLE "public"."pembayaran" ADD CONSTRAINT "pembayaran_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
