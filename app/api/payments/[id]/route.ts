import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const pembayaran = await prisma.pembayaran.findUnique({
            where: { id },
            include: {
                siswa: {
                    select: {
                        nama: true,
                        kelas: true
                    }
                }
            }
        });

        if (!pembayaran) {
            return NextResponse.json(
                { success: false, error: 'Pembayaran tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: pembayaran.id,
                status: pembayaran.status,
                amount: pembayaran.amount,
                startMonth: pembayaran.startMonth,
                endMonth: pembayaran.endMonth,
                filePath: pembayaran.filePath,
                fileName: pembayaran.fileName,
                createdAt: pembayaran.createdAt,
                updatedAt: pembayaran.updatedAt,
                approvedAt: pembayaran.approvedAt,
                rejectionReason: pembayaran.rejectionReason,
                student: {
                    nama: pembayaran.siswa.nama,
                    kelas: pembayaran.siswa.kelas
                }
            }
        });

    } catch (error) {
        console.error('Get payment error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat mengambil data pembayaran' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status, rejectionReason, approvedBy } = body;

        // Validate status
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Status tidak valid' },
                { status: 400 }
            );
        }

        // Check if payment exists
        const existingPayment = await prisma.pembayaran.findUnique({
            where: { id }
        });

        if (!existingPayment) {
            return NextResponse.json(
                { success: false, error: 'Pembayaran tidak ditemukan' },
                { status: 404 }
            );
        }

        // Update payment status
        const updateData: any = {
            status,
            updatedAt: new Date()
        };

        if (status === 'APPROVED') {
            updateData.approvedAt = new Date();
            updateData.approvedBy = approvedBy;
            updateData.rejectionReason = null;
        } else if (status === 'REJECTED') {
            updateData.rejectionReason = rejectionReason;
            updateData.approvedAt = null;
            updateData.approvedBy = null;
        }

        const pembayaran = await prisma.pembayaran.update({
            where: { id },
            data: updateData,
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
                startMonth: pembayaran.startMonth,
                endMonth: pembayaran.endMonth,
                approvedAt: pembayaran.approvedAt,
                rejectionReason: pembayaran.rejectionReason,
                student: {
                    nama: pembayaran.siswa.nama,
                    kelas: pembayaran.siswa.kelas
                }
            }
        });

    } catch (error) {
        console.error('Update payment error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat memperbarui status pembayaran' },
            { status: 500 }
        );
    }
}
