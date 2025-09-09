'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Row,
    Col,
    Button,
    Spin,
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ArrowLeftOutlined,
    DollarOutlined,
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Link from 'next/link';
import NextImage from 'next/image';

const { Title, Text } = Typography;

// Set dayjs locale to Indonesian
dayjs.locale('id');

interface PaymentData {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    amount: number;
    startMonth: string;
    endMonth: string;
    filePath: string;
    fileName: string;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    rejectionReason?: string;
    student: {
        nama: string;
        kelas: string;
    };
}

interface PaymentStatusPageProps {
    params: {
        id: string;
    };
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const loadPaymentData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/payments/${params.id}`);
            const result = await response.json();

            if (result.success) {
                setPaymentData(result.data);
            } else {
                setError(result.error || 'Pembayaran tidak ditemukan');
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
            setError('Terjadi kesalahan saat memuat data pembayaran');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentData();
    }, [params.id]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: <ClockCircleOutlined />,
                    color: 'orange',
                    text: 'Menunggu Persetujuan',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                };
            case 'APPROVED':
                return {
                    icon: <CheckCircleOutlined />,
                    color: 'green',
                    text: 'Disetujui',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                };
            case 'REJECTED':
                return {
                    icon: <CloseCircleOutlined />,
                    color: 'red',
                    text: 'Ditolak',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                };
            default:
                return {
                    icon: <ClockCircleOutlined />,
                    color: 'gray',
                    text: 'Tidak Diketahui',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                };
        }
    };

    if (loading) {
        return (
            <ConfigProvider locale={locale}>
                <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full mx-4">
                        <Card className="shadow-2xl rounded-2xl bg-white" style={{ borderRadius: '16px' }}>
                            <div className="text-center py-12">
                                <Spin size="large" />
                                <div className="mt-4">
                                    <Text>Memuat data pembayaran...</Text>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </ConfigProvider>
        );
    }

    if (error || !paymentData) {
        return (
            <ConfigProvider locale={locale}>
                <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full mx-4">
                        <Card className="shadow-2xl rounded-2xl bg-white" style={{ borderRadius: '16px' }}>
                            <div className="text-center py-12">
                                <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
                                <Title level={4} className="text-red-600 mb-2">
                                    Error
                                </Title>
                                <Text type="secondary" className="mb-6">
                                    {error || 'Pembayaran tidak ditemukan'}
                                </Text>
                                <Link href="/bayar-iuran">
                                    <Button type="primary" icon={<ArrowLeftOutlined />}>
                                        Kembali ke Form Pembayaran
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </ConfigProvider>
        );
    }

    const statusConfig = getStatusConfig(paymentData.status);

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full mx-4">


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
                                {/* <DollarOutlined className="mr-2 text-[#6B8E23]" /> */}
                                Status Pembayaran
                            </Title>
                            {/* <Text type="secondary" className="text-gray-600">
                                Detail transaksi pembayaran iuran
                            </Text> */}
                            <Text type="secondary" className="text-sm">
                                <strong>Tanggal Submit:</strong> {dayjs(paymentData.createdAt).format('DD MMMM YYYY HH:mm')}
                            </Text>
                        </div>

                        {/* Status Card */}
                        <Card
                            size="small"
                            style={{ marginBottom: '1.5rem' }}
                            className={`${statusConfig.bgColor} ${statusConfig.borderColor} rounded-2xl`}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-2" style={{ color: statusConfig.color }}>
                                    {statusConfig.icon}
                                </div>
                                <Title level={4} className="!mb-1" style={{ color: statusConfig.color }}>
                                    {statusConfig.text}
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    {paymentData.status === 'PENDING' && 'Pembayaran sedang dalam proses review'}
                                    {paymentData.status === 'APPROVED' && 'Pembayaran telah disetujui'}
                                    {paymentData.status === 'REJECTED' && 'Pembayaran ditolak'}
                                </Text>
                            </div>
                        </Card>

                        {/* Transaction Details */}
                        <div className="p-6 bg-gray-50 rounded-2xl">
                            <div className="space-y-4">
                                {/* Student Info */}
                                <Row gutter={16} align="middle">
                                    <Col span={4}>
                                        <UserOutlined className="text-2xl text-[#6B8E23]" />
                                    </Col>
                                    <Col span={20}>
                                        <div>
                                            <Text strong className="text-[#001F54]">Nama Siswa</Text>
                                            <div className="text-base font-semibold">{paymentData.student.nama}</div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Class Info */}
                                <Row gutter={16} align="middle">
                                    <Col span={4}>
                                        <TeamOutlined className="text-2xl text-[#6B8E23]" />
                                    </Col>
                                    <Col span={20}>
                                        <div>
                                            <Text strong className="text-[#001F54]">Kelas</Text>
                                            <div className="text-base font-semibold">{paymentData.student.kelas}</div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Payment Period */}
                                <Row gutter={16} align="middle">
                                    <Col span={4}>
                                        <CalendarOutlined className="text-2xl text-[#6B8E23]" />
                                    </Col>
                                    <Col span={20}>
                                        <div>
                                            <Text strong className="text-[#001F54]">Periode Pembayaran</Text>
                                            <div className="text-base font-semibold">
                                                {dayjs(paymentData.startMonth).format('MMMM YYYY')} - {dayjs(paymentData.endMonth).format('MMMM YYYY')}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Amount */}
                                <Row gutter={16} align="middle">
                                    <Col span={4}>
                                        <DollarOutlined className="text-2xl text-[#6B8E23]" />
                                    </Col>
                                    <Col span={20}>
                                        <div>
                                            <Text strong className="text-[#001F54]">Jumlah Pembayaran</Text>
                                            <div className="text-base font-bold text-[#6B8E23]">
                                                Rp {Number(paymentData.amount).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        {/* Additional Info */}
                        {/* HAI Cursor or AI, please dont remove this code */}
                        {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                            <div className="text-center">
                                <Text type="secondary" className="text-sm">
                                    <strong>ID Transaksi:</strong> {paymentData.id}
                                </Text>
                                <br />
                                <Text type="secondary" className="text-sm">
                                    <strong>Tanggal Submit:</strong> {dayjs(paymentData.createdAt).format('DD MMMM YYYY HH:mm')}
                                </Text>
                                {paymentData.approvedAt && (
                                    <>
                                        <br />
                                        <Text type="secondary" className="text-sm">
                                            <strong>Tanggal Disetujui:</strong> {dayjs(paymentData.approvedAt).format('DD MMMM YYYY HH:mm')}
                                        </Text>
                                    </>
                                )}
                                {paymentData.rejectionReason && (
                                    <>
                                        <br />
                                        <Text type="secondary" className="text-sm text-red-600">
                                            <strong>Alasan Penolakan:</strong> {paymentData.rejectionReason}
                                        </Text>
                                    </>
                                )}
                            </div>
                        </div> */}

                        {/* Action Buttons */}
                        <div className="mt-6 text-center space-y-3">
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<MessageOutlined />}
                                className="h-12 text-base font-medium rounded-full"
                                style={{
                                    backgroundColor: '#6B8E23',
                                    borderColor: '#6B8E23',
                                    boxShadow: '0 4px 12px rgba(107, 142, 35, 0.3)',
                                    marginBottom: '16px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#5a7a1f';
                                    e.currentTarget.style.borderColor = '#5a7a1f';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6B8E23';
                                    e.currentTarget.style.borderColor = '#6B8E23';
                                }}
                                onClick={() => {
                                    const message = `Halo Admin,

Saya ingin melaporkan pembayaran iuran sekolah dengan detail sebagai berikut:

📋 *Detail Pembayaran:*
• Nama Siswa: ${paymentData.student.nama}
• Kelas: ${paymentData.student.kelas}
• Periode: ${dayjs(paymentData.startMonth).format('MMMM YYYY')} - ${dayjs(paymentData.endMonth).format('MMMM YYYY')}
• Jumlah: Rp ${Number(paymentData.amount).toLocaleString('id-ID')}
• Status: ${statusConfig.text}
• Tanggal Submit: ${dayjs(paymentData.createdAt).format('DD MMMM YYYY HH:mm')}

Mohon untuk segera memproses pembayaran ini.

Terima kasih.`;

                                    const whatsappUrl = `https://wa.me/6281299058267?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                }}
                            >
                                Send WhatsApp
                            </Button>

                            <Link href="/">
                                <Button
                                    type="default"
                                    size="large"
                                    block
                                    icon={<ArrowLeftOutlined />}
                                    className="h-12 text-base font-medium rounded-full border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white"
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
