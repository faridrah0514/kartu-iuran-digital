import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

export const dynamic = 'force-dynamic';

dayjs.extend(isSameOrBefore);

export async function GET() {
    try {
        // Get all approved payments
        const approvedPayments = await prisma.pembayaran.findMany({
            where: {
                status: 'APPROVED'
            },
            include: {
                siswa: {
                    select: {
                        id: true,
                        nama: true,
                        kelas: true
                    }
                }
            },
            orderBy: [
                { siswa: { kelas: 'asc' } },
                { siswa: { nama: 'asc' } },
                { startMonth: 'asc' }
            ]
        });

        // Group payments by student
        const studentPayments: Record<string, {
            id: string;
            nama: string;
            kelas: string;
            paidMonths: string[];
        }> = {};

        // Process each payment to extract paid months
        approvedPayments.forEach(payment => {
            const studentId = payment.siswaId;
            const student = payment.siswa;

            if (!studentPayments[studentId]) {
                studentPayments[studentId] = {
                    id: studentId,
                    nama: student.nama,
                    kelas: student.kelas,
                    paidMonths: []
                };
            }

            // Generate all months between startMonth and endMonth
            const startMonth = dayjs(payment.startMonth);
            const endMonth = dayjs(payment.endMonth);

            let currentMonth = startMonth;
            while (currentMonth.isSameOrBefore(endMonth, 'month')) {
                const monthKey = currentMonth.format('YYYY-MM');
                if (!studentPayments[studentId].paidMonths.includes(monthKey)) {
                    studentPayments[studentId].paidMonths.push(monthKey);
                }
                currentMonth = currentMonth.add(1, 'month');
            }
        });

        // Convert to array and sort paid months
        const result = Object.values(studentPayments).map(student => ({
            ...student,
            paidMonths: student.paidMonths.sort()
        }));

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get approved payments error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat mengambil data pembayaran yang disetujui' },
            { status: 500 }
        );
    }
}
