import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

function parseCSV(csvContent: string): Array<{ nama: string; kelas: string; jenis_kelamin: string }> {
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',')
    const data: Array<{ nama: string; kelas: string; jenis_kelamin: string }> = []

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 3) {
            data.push({
                nama: values[0].trim(),
                kelas: values[1].trim(),
                jenis_kelamin: values[2].trim()
            })
        }
    }

    return data
}

function mapJenisKelamin(jenisKelamin: string): 'LAKI_LAKI' | 'PEREMPUAN' {
    return jenisKelamin === 'Laki-laki' ? 'LAKI_LAKI' : 'PEREMPUAN'
}

function mapKelas(kelas: string): 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'B4' {
    return kelas as 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'B4'
}

async function main() {
    console.log('🌱 Starting database seeding...')

    try {
        // Read CSV file
        const csvPath = join(process.cwd(), 'prisma', 'data_siswa.csv')
        const csvContent = readFileSync(csvPath, 'utf-8')

        console.log('📄 Reading CSV file...')
        const csvData = parseCSV(csvContent)
        console.log(`📊 Found ${csvData.length} students in CSV`)

        // Convert CSV data to database format
        const students = csvData.map((row) => ({
            nama: row.nama,
            jenis_kelamin: mapJenisKelamin(row.jenis_kelamin),
            kelas: mapKelas(row.kelas),
        }))

        console.log('🔄 Creating students in database...')

        // Create students in batches for better performance
        const batchSize = 50
        for (let i = 0; i < students.length; i += batchSize) {
            const batch = students.slice(i, i + batchSize)

            for (const student of batch) {
                await prisma.siswa.upsert({
                    where: {
                        nama_kelas: {
                            nama: student.nama,
                            kelas: student.kelas,
                        }
                    },
                    update: {},
                    create: student,
                })
            }

            console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(students.length / batchSize)}`)
        }

        console.log(`✅ Created ${students.length} students from CSV`)

        // Verify the data
        const totalSiswa = await prisma.siswa.count()
        console.log(`🎉 Seeding completed! Total students in database: ${totalSiswa}`)

    } catch (error) {
        console.error('❌ Error reading CSV file:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
