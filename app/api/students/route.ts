import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const kelas = searchParams.get('kelas');

        // Build where clause for filtering
        const where: any = {};

        if (kelas) {
            where.kelas = kelas;
        }

        const students = await prisma.siswa.findMany({
            where,
            select: {
                id: true,
                nama: true,
                kelas: true,
                jenis_kelamin: true,
            },
            orderBy: {
                nama: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: students
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch students'
            },
            { status: 500 }
        );
    }
}
