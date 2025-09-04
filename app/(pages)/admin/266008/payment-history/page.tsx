'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    message,
    Row,
    Col,
    Tag,
    Select,
    Input,
    Table,
    Image,
    Modal,
    Statistic,
} from 'antd';
import {
    ArrowLeftOutlined,
    SearchOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    FileImageOutlined,
    UserOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import Link from 'next/link';
import NextImage from 'next/image';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Set dayjs locale to Indonesian
dayjs.locale('id');

interface Payment {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    amount: number;
    startMonth: string;
    endMonth: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectionReason?: string;
    siswa: {
        nama: string;
        kelas: string;
    };
}

interface PaymentStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
}

export default function PaymentHistoryPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [stats, setStats] = useState<PaymentStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0,
    });
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        kelas: '',
    });

    const loadPayments = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/payments');
            const result = await response.json();

            if (result.success) {
                setPayments(result.data);
                setFilteredPayments(result.data);
                calculateStats(result.data);
            } else {
                message.error('Gagal memuat data pembayaran');
            }
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            message.error(`Terjadi kesalahan saat memuat data: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Payment[]) => {
        const stats = {
            total: data.length,
            pending: data.filter(p => p.status === 'PENDING').length,
            approved: data.filter(p => p.status === 'APPROVED').length,
            rejected: data.filter(p => p.status === 'REJECTED').length,
            totalAmount: data.reduce((sum, p) => sum + Number(p.amount), 0),
        };
        setStats(stats);
    };

    const applyFilters = () => {
        let filtered = [...payments];

        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.siswa.nama.toLowerCase().includes(searchLower) ||
                p.siswa.kelas.toLowerCase().includes(searchLower)
            );
        }

        if (filters.kelas) {
            filtered = filtered.filter(p => p.siswa.kelas === filters.kelas);
        }

        setFilteredPayments(filtered);
    };

    const showPreview = (payment: Payment) => {
        setSelectedPayment(payment);
        setPreviewVisible(true);
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Tag icon={<ClockCircleOutlined />} color="orange">Pending</Tag>;
            case 'APPROVED':
                return <Tag icon={<CheckCircleOutlined />} color="green">Disetujui</Tag>;
            case 'REJECTED':
                return <Tag icon={<CloseCircleOutlined />} color="red">Ditolak</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const getUniqueKelas = () => {
        const kelasSet = new Set(payments.map(p => p.siswa.kelas));
        return Array.from(kelasSet).sort();
    };

    const columns = [
        {
            title: 'Siswa',
            dataIndex: 'siswa',
            key: 'siswa',
            render: (siswa: { nama: string; kelas: string }) => (
                <div>
                    <div className="font-medium text-[#001F54]">{siswa.nama}</div>
                    <div className="text-sm text-gray-500">Kelas {siswa.kelas}</div>
                </div>
            ),
        },
        {
            title: 'Periode',
            key: 'period',
            render: (record: Payment) => (
                <div className="text-sm">
                    <div className="flex items-center space-x-1">
                        <CalendarOutlined className="text-[#6B8E23]" />
                        <span>
                            {dayjs(record.startMonth).format('MMM YYYY')} - {dayjs(record.endMonth).format('MMM YYYY')}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Jumlah',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
                <div className="font-medium text-green-600">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(amount)}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: 'Tanggal',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <div className="text-sm text-gray-600">
                    {dayjs(date).format('DD MMM YYYY HH:mm')}
                </div>
            ),
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (record: Payment) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => showPreview(record)}
                    className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                >
                    Detail
                </Button>
            ),
        },
    ];

    useEffect(() => {
        loadPayments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, payments]);

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] p-4">
                <div className="max-w-7xl mx-auto">
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
                                <FileImageOutlined className="mr-2 text-[#6B8E23]" />
                                Riwayat Pembayaran
                            </Title>
                            <Text type="secondary" className="text-gray-600">
                                Semua data pembayaran iuran sekolah
                            </Text>
                        </div>

                        {/* Statistics Cards - 2x2 Grid */}
                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={12} sm={12} md={12}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Total"
                                        value={stats.total}
                                        valueStyle={{ color: '#001F54' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={12}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Pending"
                                        value={stats.pending}
                                        valueStyle={{ color: '#faad14' }}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={12}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Disetujui"
                                        value={stats.approved}
                                        valueStyle={{ color: '#52c41a' }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={12}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Ditolak"
                                        value={stats.rejected}
                                        valueStyle={{ color: '#ff4d4f' }}
                                        prefix={<CloseCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Filters */}
                        <Card className="mb-6">
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} sm={8} md={6}>
                                    <Search
                                        placeholder="Cari nama siswa..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        prefix={<SearchOutlined />}
                                        allowClear
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={6}>
                                    <Select
                                        placeholder="Filter Status"
                                        value={filters.status}
                                        onChange={(value) => setFilters({ ...filters, status: value })}
                                        allowClear
                                        className="w-full"
                                    >
                                        <Option value="PENDING">Menunggu</Option>
                                        <Option value="APPROVED">Disetujui</Option>
                                        <Option value="REJECTED">Ditolak</Option>
                                    </Select>
                                </Col>
                                <Col xs={24} sm={8} md={6}>
                                    <Select
                                        placeholder="Filter Kelas"
                                        value={filters.kelas}
                                        onChange={(value) => setFilters({ ...filters, kelas: value })}
                                        allowClear
                                        className="w-full"
                                    >
                                        {getUniqueKelas().map(kelas => (
                                            <Option key={kelas} value={kelas}>Kelas {kelas}</Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col xs={24} sm={24} md={6}>
                                    <div className="text-right">
                                        <Text type="secondary">
                                            Menampilkan {filteredPayments.length} dari {payments.length} pembayaran
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Payment Table */}
                        <div className="mb-6">
                            <Table
                                columns={columns}
                                dataSource={filteredPayments}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} dari ${total} pembayaran`,
                                }}
                                scroll={{ x: 800 }}
                            />
                        </div>

                        {/* Back Button */}
                        <div>
                            <Link href="/admin/266008">
                                <Button
                                    type="default"
                                    size="large"
                                    block
                                    icon={<ArrowLeftOutlined />}
                                    className="h-12 text-base font-medium rounded-full border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white"
                                >
                                    Kembali ke Dashboard
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Payment Detail Modal */}
                    <Modal
                        title={
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                                <FileImageOutlined className="text-[#6B8E23] text-lg" />
                                <span className="text-lg font-semibold text-[#001F54]">Detail Pembayaran</span>
                            </div>
                        }
                        open={previewVisible}
                        onCancel={() => setPreviewVisible(false)}
                        width={800}
                        footer={null}
                        className="rounded-xl"
                        styles={{
                            header: {
                                borderBottom: 'none',
                                paddingBottom: '0',
                                marginBottom: '10px',
                                paddingLeft: '0px',
                                paddingRight: '0px'
                            },
                            body: {
                                padding: '0',
                                paddingLeft: '0',
                                paddingRight: '0'
                            }
                        }}
                    >
                        {selectedPayment && (
                            <div className="bg-white">
                                {/* Student Info */}
                                <div className="py-4 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center">
                                            <UserOutlined className="text-white text-lg" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-[#001F54]">
                                                {selectedPayment.siswa.nama}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Kelas {selectedPayment.siswa.kelas}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="py-4 space-y-4">
                                    {/* Status and Period */}
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-500 mb-1">Status</div>
                                                <div className="text-sm font-medium">
                                                    {getStatusTag(selectedPayment.status)}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-sm text-gray-500 mb-1">Periode</div>
                                                <div className="text-sm font-medium text-[#001F54]">
                                                    {dayjs(selectedPayment.startMonth).format('MMM YYYY')} - {dayjs(selectedPayment.endMonth).format('MMM YYYY')}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* Amount */}
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Jumlah Pembayaran</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }).format(selectedPayment.amount)}
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <Row gutter={[16, 16]}>
                                        <Col span={24}>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-500 mb-1">Tanggal Upload</div>
                                                <div className="text-sm font-medium">
                                                    {dayjs(selectedPayment.createdAt).format('DD MMMM YYYY HH:mm')}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* Approval Info */}
                                    {selectedPayment.status === 'APPROVED' && selectedPayment.approvedAt && (
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <div className="text-sm text-gray-500 mb-1">Disetujui pada</div>
                                            <div className="text-sm font-medium text-green-600">
                                                {dayjs(selectedPayment.approvedAt).format('DD MMMM YYYY HH:mm')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejection Info */}
                                    {selectedPayment.status === 'REJECTED' && selectedPayment.rejectionReason && (
                                        <div className="p-3 bg-red-50 rounded-lg">
                                            <div className="text-sm text-gray-500 mb-1">Alasan Penolakan</div>
                                            <div className="text-sm font-medium text-red-600">
                                                {selectedPayment.rejectionReason}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bukti Transfer */}
                                    <div>
                                        <div className="text-sm font-medium text-[#001F54] mb-2">Bukti Transfer</div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <Image
                                                src={selectedPayment.filePath}
                                                alt="Bukti Transfer"
                                                className="w-full"
                                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </ConfigProvider>
    );
}
