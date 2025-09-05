import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileUploadResult {
    filePath: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, WebP)'
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'Ukuran file harus kurang dari 5MB'
        };
    }

    return { valid: true };
}

export async function savePaymentFile(
    file: File,
    siswaId: string,
    kelas: string,
    startMonth: string,
    endMonth: string
): Promise<FileUploadResult> {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const year = new Date().getFullYear();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `bukti_transfer_${Date.now()}.${fileExtension}`;

    // Create directory structure: public/uploads/pembayaran/2025/A1/siswa_id/2025-07_2025-09/
    const directory = join(
        process.cwd(),
        'public',
        'uploads',
        'pembayaran',
        year.toString(),
        kelas,
        siswaId,
        `${startMonth}_${endMonth}`
    );

    // Create directory if it doesn't exist
    await mkdir(directory, { recursive: true });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const filePath = join(directory, fileName);
    await writeFile(filePath, buffer);

    // Return relative path from public directory
    const relativePath = `/uploads/pembayaran/${year}/${kelas}/${siswaId}/${startMonth}_${endMonth}/${fileName}`;

    return {
        filePath: relativePath,
        fileName,
        fileSize: file.size,
        fileMimeType: file.type
    };
}

export function getFileUrl(filePath: string): string {
    return `/${filePath}`;
}
