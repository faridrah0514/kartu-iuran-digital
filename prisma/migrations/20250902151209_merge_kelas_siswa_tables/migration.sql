/*
  Warnings:

  - You are about to drop the column `kelas_id` on the `siswa` table. All the data in the column will be lost.
  - You are about to drop the `kelas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `kelas` to the `siswa` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."KelasEnum" AS ENUM ('A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4');

-- DropForeignKey
ALTER TABLE "public"."siswa" DROP CONSTRAINT "siswa_kelas_id_fkey";

-- AlterTable
ALTER TABLE "public"."siswa" DROP COLUMN "kelas_id",
ADD COLUMN     "kelas" "public"."KelasEnum" NOT NULL;

-- DropTable
DROP TABLE "public"."kelas";
