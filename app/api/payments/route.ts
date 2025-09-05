import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { savePaymentFile } from '@/lib/fileUpload';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const dynamic = 'force-dynamic';

const MONTHLY_FEE = 30000; // IDR

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Extract form data
        const siswaId = formData.get('siswaId') as string;
        const startMonth = formData.get('startMonth') as string;
        const endMonth = formData.get('endMonth') as string;
        const file = formData.get('file') as File;

        // Validate required fields
        if (!siswaId || !startMonth || !endMonth || !file) {
            return NextResponse.json(
                { success: false, error: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        // Validate student exists
        const siswa = await prisma.siswa.findUnique({
            where: { id: siswaId }
        });

        if (!siswa) {
            return NextResponse.json(
                { success: false, error: 'Siswa tidak ditemukan' },
                { status: 404 }
            );
        }

        // Parse dates
        const startDate = dayjs(startMonth, 'YYYY-MM').startOf('month').toDate();
        const endDate = dayjs(endMonth, 'YYYY-MM').endOf('month').toDate();

        // Calculate amount
        const monthsDiff = dayjs(endDate).diff(dayjs(startDate), 'month') + 1;
        const amount = monthsDiff * MONTHLY_FEE;

        // Check for existing payment for the same period
        const existingPayment = await prisma.pembayaran.findFirst({
            where: {
                siswaId,
                startMonth: startDate,
                endMonth: endDate,
                status: { not: 'REJECTED' }
            }
        });

        if (existingPayment) {
            return NextResponse.json(
                { success: false, error: 'Pembayaran untuk periode ini sudah ada' },
                { status: 400 }
            );
        }

        // Save file
        const fileResult = await savePaymentFile(
            file,
            siswaId,
            siswa.kelas,
            startMonth,
            endMonth
        );

        // Create payment record
        const pembayaran = await prisma.pembayaran.create({
            data: {
                siswaId,
                startMonth: startDate,
                endMonth: endDate,
                amount,
                filePath: fileResult.filePath,
                fileName: fileResult.fileName,
                fileSize: fileResult.fileSize,
                fileMimeType: fileResult.fileMimeType,
                status: 'PENDING'
            },
            include: {
                siswa: {
                    select: {
                        nama: true,
                        kelas: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                id: pembayaran.id,
                status: pembayaran.status,
                amount: pembayaran.amount,
                period: `${startMonth} - ${endMonth}`,
                student: {
                    nama: pembayaran.siswa.nama,
                    kelas: pembayaran.siswa.kelas
                }
            }
        });

    } catch (error) {
        console.error('Payment submission error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat menyimpan pembayaran' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const siswaId = searchParams.get('siswaId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const approvedOnly = searchParams.get('approvedOnly') === 'true';

        const where: any = {};
        if (siswaId) where.siswaId = siswaId;
        if (status) where.status = status;
        if (approvedOnly) where.status = 'APPROVED';

        const [pembayaran, total] = await Promise.all([
            prisma.pembayaran.findMany({
                where,
                include: {
                    siswa: {
                        select: {
                            nama: true,
                            kelas: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.pembayaran.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: pembayaran,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat mengambil data pembayaran' },
            { status: 500 }
        );
    }
}
