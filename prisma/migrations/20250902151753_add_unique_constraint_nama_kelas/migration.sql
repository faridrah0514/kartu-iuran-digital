/*
  Warnings:

  - A unique constraint covering the columns `[nama,kelas]` on the table `siswa` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "siswa_nama_kelas_key" ON "public"."siswa"("nama", "kelas");
