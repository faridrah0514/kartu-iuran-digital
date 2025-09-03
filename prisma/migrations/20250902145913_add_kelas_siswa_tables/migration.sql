-- CreateEnum
CREATE TYPE "public"."JenisKelamin" AS ENUM ('Laki-laki', 'Perempuan');

-- CreateTable
CREATE TABLE "public"."kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."siswa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis_kelamin" "public"."JenisKelamin" NOT NULL,
    "kelas_id" TEXT NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."siswa" ADD CONSTRAINT "siswa_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
