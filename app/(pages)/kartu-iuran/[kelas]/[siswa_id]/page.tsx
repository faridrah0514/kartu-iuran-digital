'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Row,
    Col,
    Tag,
    Spin,
    Space,
    Divider,
    Button,
    Empty,
} from 'antd';
import {
    CheckCircleOutlined,
    CalendarOutlined,
    UserOutlined,
    TeamOutlined,
    ArrowLeftOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import Link from 'next/link';
import NextImage from 'next/image';
import { useParams } from 'next/navigation';

const { Title, Text } = Typography;

// Set dayjs locale to Indonesian
dayjs.locale('id');
dayjs.extend(isSameOrBefore);

// Indonesian month names
const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Generate all months from July 2025 to June 2026
const generateAllMonths = () => {
    const months = [];
    let current = dayjs('2025-07-01');
    const end = dayjs('2026-06-30');

    while (current.isSameOrBefore(end, 'month')) {
        months.push({
            key: current.format('YYYY-MM'),
            display: `${INDONESIAN_MONTHS[current.month()]} ${current.year()}`,
            month: current.month(),
            year: current.year()
        });
        current = current.add(1, 'month');
    }

    return months;
};

interface StudentPayment {
    id: string;
    nama: string;
    kelas: string;
    paidMonths: string[];
}

interface MonthInfo {
    key: string;
    display: string;
    month: number;
    year: number;
}

export default function KartuIuranPage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [studentPayment, setStudentPayment] = useState<StudentPayment | null>(null);
    const [allMonths] = useState<MonthInfo[]>(generateAllMonths());
    const [error, setError] = useState<string>('');

    const kelas = params.kelas as string;
    const siswaId = params.siswa_id as string;

    // Fetch student payment data
    const fetchStudentPayment = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/payments/approved');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payment data');
            }

            // Find the specific student
            const student = result.data.find((s: StudentPayment) =>
                s.id === siswaId && s.kelas === kelas
            );

            if (!student) {
                setError('Data pembayaran siswa tidak ditemukan');
                return;
            }

            setStudentPayment(student);
        } catch (error) {
            console.error('Error fetching student payment:', error);
            setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentPayment();
    }, [kelas, siswaId]);

    const isMonthPaid = (monthKey: string) => {
        return studentPayment?.paidMonths.includes(monthKey) || false;
    };

    const getPaidMonthsCount = () => {
        return studentPayment?.paidMonths.length || 0;
    };

    const getTotalMonths = () => {
        return allMonths.length;
    };

    const getPaymentProgress = () => {
        const paid = getPaidMonthsCount();
        const total = getTotalMonths();
        return Math.round((paid / total) * 100);
    };

    const getTotalPaidAmount = () => {
        const paidMonths = getPaidMonthsCount();
        const monthlyFee = 30000; // IDR
        return paidMonths * monthlyFee;
    };

    if (loading) {
        return (
            <ConfigProvider locale={locale}>
                <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                    <div className="max-w-4xl w-full mx-4">
                        <Card className="shadow-2xl rounded-2xl bg-white" style={{ borderRadius: '16px' }}>
                            <div className="text-center py-12">
                                <Spin size="large" />
                                <div className="mt-4">
                                    <Text type="secondary">Memuat data pembayaran...</Text>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </ConfigProvider>
        );
    }

    if (error) {
        return (
            <ConfigProvider locale={locale}>
                <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                    <div className="max-w-4xl w-full mx-4">
                        <Card className="shadow-2xl rounded-2xl bg-white" style={{ borderRadius: '16px' }}>
                            <div className="text-center py-12">
                                <Empty
                                    description={error}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                                <div className="mt-4">
                                    <Button
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        onClick={fetchStudentPayment}
                                        style={{
                                            backgroundColor: '#6B8E23',
                                            borderColor: '#6B8E23'
                                        }}
                                    >
                                        Coba Lagi
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                <div className="max-w-4xl w-full mx-4">
                    <Card className="shadow-2xl rounded-2xl bg-white" style={{ borderRadius: '16px' }}>
                        <div className="text-center" style={{ marginBottom: '16px' }}>
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
                                Status pembayaran iuran per bulan
                            </Text>
                        </div>

                        {/* Student Info */}
                        <Card size="small" className="mb-6 bg-[#6B8E23]/10 border-[#6B8E23]/20 rounded-2xl" style={{ marginBottom: '16px' }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Space>
                                        <UserOutlined className="text-[#6B8E23]" />
                                        <Text strong className="text-[#001F54] text-lg">
                                            {studentPayment?.nama}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col>
                                    <Tag color="blue" className="text-base px-3 py-1">
                                        <TeamOutlined className="mr-1" />
                                        {studentPayment?.kelas}
                                    </Tag>
                                </Col>
                            </Row>
                        </Card>

                        {/* Progress Summary */}
                        <Card size="small" className="mb-6 bg-gradient-to-r from-[#6B8E23]/10 to-[#6B8E23]/5 border-[#6B8E23]/20 rounded-2xl" style={{ marginBottom: '16px' }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Text strong className="text-[#001F54] text-lg">
                                        Progress Pembayaran:
                                    </Text>
                                </Col>
                                <Col>
                                    <Text strong className="text-xl text-[#6B8E23]">
                                        {getPaidMonthsCount()}/{getTotalMonths()} bulan
                                    </Text>
                                </Col>
                            </Row>
                            <Row justify="space-between" className="mt-2">
                                <Col span={24}>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-[#6B8E23] h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${getPaymentProgress()}%` }}
                                        ></div>
                                    </div>
                                </Col>
                            </Row>
                            <Row justify="space-between" className="mt-3">
                                <Col>
                                    <Text type="secondary" className="text-sm">
                                        Total Terbayar:
                                    </Text>
                                </Col>
                                <Col>
                                    <Text strong className="text-lg text-[#6B8E23]">
                                        Rp {getTotalPaidAmount().toLocaleString('id-ID')}
                                    </Text>
                                </Col>
                            </Row>
                            {/* hai AI, please dont remove this code */}
                            {/* <Row justify="space-between" className="mt-1">
                                <Col>
                                    <Text type="secondary" className="text-xs">
                                        {getPaidMonthsCount()} bulan × Rp 30.000
                                    </Text>
                                </Col>
                            </Row> */}
                        </Card>

                        {/* <Divider /> */}

                        {/* Monthly Status Grid */}
                        <div className="mb-6">
                            <Title level={4} className="text-center text-[#001F54] mb-4">
                                Status Pembayaran Per Bulan
                            </Title>
                            <Row gutter={[12, 12]}>
                                {allMonths.map((month) => {
                                    const isPaid = isMonthPaid(month.key);
                                    return (
                                        <Col xs={12} sm={8} md={6} lg={4} key={month.key}>
                                            <Card
                                                size="small"
                                                className={`text-center rounded-xl transition-all duration-200 ${isPaid
                                                    ? 'bg-[#6B8E23]/10 border-[#6B8E23] shadow-md'
                                                    : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                style={{
                                                    borderRadius: '12px',
                                                    minHeight: '80px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <div className="mb-2">
                                                    {isPaid ? (
                                                        <CheckCircleOutlined
                                                            className="text-2xl text-[#6B8E23]"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 mx-auto border-2 border-gray-300 rounded-full"></div>
                                                    )}
                                                </div>
                                                <Text
                                                    strong
                                                    className={`text-xs ${isPaid ? 'text-[#6B8E23]' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {month.display}
                                                </Text>
                                                {isPaid && (
                                                    <div className="mt-1">
                                                        <Tag
                                                            color="green"
                                                            className="text-xs"
                                                        >
                                                            Lunas
                                                        </Tag>
                                                    </div>
                                                )}
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>

                        <Divider />

                        {/* Action Buttons */}
                        <Row gutter={16} justify="center">
                            <Col span={24}>
                                <Link href="/">
                                    <Button
                                        type="default"
                                        size="large"
                                        icon={<ArrowLeftOutlined />}
                                        className="h-12 text-base font-medium rounded-full px-8 border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white w-full"
                                    >
                                        Kembali
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>
        </ConfigProvider>
    );
}
