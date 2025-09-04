'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Tag,
    Spin,
    Space,
    Button,
    message,
    Select,
    Form,
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    TeamOutlined,
    ArrowLeftOutlined,
    ShareAltOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

// API function to fetch students
const fetchStudents = async (kelas?: string) => {
    const params = new URLSearchParams();
    if (kelas) params.append('kelas', kelas);

    const response = await fetch(`/api/students?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Failed to fetch students');
    }

    return result.data;
};

interface Student {
    id: string;
    nama: string;
    kelas: string;
    jenis_kelamin: string;
}

interface StudentPayment {
    id: string;
    nama: string;
    kelas: string;
    paidMonths: string[];
}


export default function KartuIuranIndexPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState<string>('');
    const [selectedStudentPayment, setSelectedStudentPayment] = useState<StudentPayment | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Fetch students from API based on selected class
    useEffect(() => {
        const loadStudents = async () => {
            if (!selectedClass) {
                setFilteredStudents([]);
                return;
            }

            setStudentsLoading(true);
            setStudentsError('');

            try {
                const students = await fetchStudents(selectedClass);
                setFilteredStudents(students);
            } catch (error) {
                console.error('Error loading students:', error);
                setStudentsError(error instanceof Error ? error.message : 'Failed to load students');
                setFilteredStudents([]);
            } finally {
                setStudentsLoading(false);
            }
        };

        loadStudents();
    }, [selectedClass]);

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        setSelectedStudent('');
        setSelectedStudentPayment(null);
        form.setFieldsValue({ siswa: undefined });
    };

    const handleStudentChange = (value: string) => {
        setSelectedStudent(value);
        form.setFieldsValue({ siswa: value });
        fetchStudentPayment(value);
    };

    // Fetch payment data for selected student
    const fetchStudentPayment = async (studentId: string) => {
        try {
            setPaymentLoading(true);
            setSelectedStudentPayment(null);

            const response = await fetch('/api/payments/approved');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payment data');
            }

            // Find the specific student's payment data
            const studentPayment = result.data.find((s: StudentPayment) => s.id === studentId);
            setSelectedStudentPayment(studentPayment || null);
        } catch (error) {
            console.error('Error fetching student payment:', error);
            setSelectedStudentPayment(null);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleShareClick = () => {
        const student = filteredStudents.find(s => s.id === selectedStudent);
        if (student) {
            const url = `${window.location.origin}/kartu-iuran/${student.kelas}/${student.id}`;
            navigator.clipboard.writeText(url).then(() => {
                message.success('Link berhasil disalin ke clipboard!');
            }).catch(() => {
                message.error('Gagal menyalin link');
            });
        }
    };

    const handleSeeDetailClick = () => {
        const student = filteredStudents.find(s => s.id === selectedStudent);
        if (student) {
            router.push(`/kartu-iuran/${student.kelas}/${student.id}`);
        }
    };

    const getPaymentProgress = () => {
        if (!selectedStudentPayment) return 0;
        const totalMonths = 12; // July 2025 to June 2026
        const paidMonths = selectedStudentPayment.paidMonths.length;
        return Math.round((paidMonths / totalMonths) * 100);
    };

    const getPaidMonthsCount = () => {
        return selectedStudentPayment?.paidMonths.length || 0;
    };

    const getTotalPaidAmount = () => {
        const paidMonths = getPaidMonthsCount();
        const monthlyFee = 30000; // IDR
        return paidMonths * monthlyFee;
    };


    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                <div className="max-w-6xl w-full mx-4">
                    <Card className="shadow-2xl rounded-2xl bg-white" style={{ borderRadius: '16px' }}>
                        <div className="text-center mb-6">
                            {/* Logo */}
                            <div className="mb-6">
                                <NextImage
                                    src="/logo/abu-dzar-logo.png"
                                    alt="Abu Dzar Logo"
                                    width={120}
                                    height={120}
                                    priority
                                    className="mx-auto"
                                />
                            </div>

                            <Title level={3} className="!mb-2 text-[#001F54]">
                                <CalendarOutlined className="mr-2 text-[#6B8E23]" />
                                Kartu Iuran
                            </Title>
                            <Text type="secondary" className="text-gray-600">
                                Pilih kelas dan siswa untuk melihat status pembayaran
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            className="space-y-4"
                        >
                            {/* Class Selection */}
                            <Form.Item
                                label={
                                    <Space>
                                        <TeamOutlined className="text-[#6B8E23]" />
                                        <span>Pilih Kelas</span>
                                    </Space>
                                }
                                name="kelas"
                                rules={[{ required: true, message: 'Pilih kelas terlebih dahulu!' }]}
                            >
                                <Select
                                    placeholder="Pilih kelas"
                                    size="large"
                                    onChange={handleClassChange}
                                    value={selectedClass}
                                >
                                    <Option value="A1">A1</Option>
                                    <Option value="A2">A2</Option>
                                    <Option value="A3">A3</Option>
                                    <Option value="B1">B1</Option>
                                    <Option value="B2">B2</Option>
                                    <Option value="B3">B3</Option>
                                    <Option value="B4">B4</Option>
                                </Select>
                            </Form.Item>

                            {/* Student Selection */}
                            <Form.Item
                                label={
                                    <Space>
                                        <UserOutlined className="text-[#6B8E23]" />
                                        <span>Pilih Siswa</span>
                                    </Space>
                                }
                                name="siswa"
                                rules={[{ required: true, message: 'Pilih siswa terlebih dahulu!' }]}
                            >
                                <Select
                                    placeholder={
                                        !selectedClass
                                            ? "Pilih kelas terlebih dahulu"
                                            : studentsLoading
                                                ? "Memuat data siswa..."
                                                : studentsError
                                                    ? "Error memuat data siswa"
                                                    : "Pilih siswa"
                                    }
                                    size="large"
                                    loading={studentsLoading}
                                    disabled={!selectedClass || studentsLoading || !!studentsError}
                                    value={selectedStudent || undefined}
                                    onChange={handleStudentChange}
                                >
                                    {filteredStudents.map((student) => (
                                        <Option key={student.id} value={student.id}>
                                            <Space>
                                                <span>{student.nama}</span>
                                                <Tag color="blue">
                                                    {student.kelas}
                                                </Tag>
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                                {studentsError && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {studentsError}
                                    </div>
                                )}
                            </Form.Item>
                        </Form>

                        {/* Selected Student Card */}
                        {selectedClass && selectedStudent && (
                            <div className="mt-6 flex justify-center">
                                <Card
                                    hoverable
                                    className="rounded-xl transition-all duration-200 hover:shadow-lg w-full max-w-sm"
                                    style={{ borderRadius: '12px' }}
                                >
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <UserOutlined className="text-4xl text-[#6B8E23]" />
                                        </div>
                                        <Tag color="blue" style={{ marginBottom: '10px', marginRight: '0px' }}>
                                            <TeamOutlined className="mr-1" />
                                            {selectedClass}
                                        </Tag>
                                        <Title level={5} className="!mb-2 text-[#001F54]">
                                            {filteredStudents.find(s => s.id === selectedStudent)?.nama}
                                        </Title>
                                        {paymentLoading ? (
                                            <div className="mb-4">
                                                <Spin size="small" />
                                                <div className="mt-2">
                                                    <Text type="secondary" className="text-xs">
                                                        Memuat data pembayaran...
                                                    </Text>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-2">
                                                    <Text type="secondary" className="text-sm">
                                                        {getPaidMonthsCount()}/12 bulan terbayar
                                                    </Text>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                    <div
                                                        className="bg-[#6B8E23] h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${getPaymentProgress()}%` }}
                                                    ></div>
                                                </div>
                                                <Text type="secondary" className="text-xs mb-4 block">
                                                    Total Terbayar: Rp {getTotalPaidAmount().toLocaleString('id-ID')}
                                                </Text>
                                            </>
                                        )}
                                        <Space>
                                            <Button
                                                type="default"
                                                size="middle"
                                                icon={<ShareAltOutlined />}
                                                onClick={handleShareClick}
                                                className="border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white"
                                            >
                                                Share
                                            </Button>
                                            <Button
                                                type="primary"
                                                size="middle"
                                                icon={<EyeOutlined />}
                                                onClick={handleSeeDetailClick}
                                                style={{
                                                    backgroundColor: '#6B8E23',
                                                    borderColor: '#6B8E23'
                                                }}
                                            >
                                                Lihat Detail
                                            </Button>
                                        </Space>
                                    </div>
                                </Card>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <Link href="/">
                                <Button
                                    type="default"
                                    size="large"
                                    icon={<ArrowLeftOutlined />}
                                    className="h-12 text-base font-medium rounded-full border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white px-8"
                                >
                                    Kembali
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </ConfigProvider>
    );
}
