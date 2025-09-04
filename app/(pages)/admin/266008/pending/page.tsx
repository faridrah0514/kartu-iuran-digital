'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    Avatar,
    message,
    Modal,
    Form,
    Input,
    Image,
    Row,
    Col,
    Tag,
} from 'antd';
import {
    TeamOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    CheckOutlined,
    CloseOutlined,
    FileImageOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import Link from 'next/link';
import NextImage from 'next/image';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
    createdAt: string;
    approvedAt?: string;
    rejectionReason?: string;
    siswa?: {
        nama: string;
        kelas: string;
    };
}

export default function PendingTransactionsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectForm] = Form.useForm();

    const loadPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('status', 'PENDING'); // Only load pending transactions

            const response = await fetch(`/api/payments?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setPayments(result.data);
            } else {
                message.error('Gagal memuat data pembayaran');
            }
        } catch (error) {
            message.error('Terjadi kesalahan saat memuat data');
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        try {
            const response = await fetch(`/api/payments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    rejectionReason: reason,
                    approvedBy: 'admin', // In real app, use actual admin ID
                }),
            });

            const result = await response.json();

            if (result.success) {
                message.success(`Pembayaran ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
                loadPayments();
                setPreviewVisible(false);
                setRejectModalVisible(false);
                rejectForm.resetFields();
            } else {
                message.error(result.error || 'Gagal memperbarui status');
            }
        } catch (error) {
            message.error('Terjadi kesalahan saat memperbarui status');
        }
    };

    const handleReject = (payment: Payment) => {
        setSelectedPayment(payment);
        setRejectModalVisible(true);
    };

    const handleRejectSubmit = async (values: { reason: string }) => {
        if (selectedPayment) {
            await updatePaymentStatus(selectedPayment.id, 'REJECTED', values.reason);
        }
    };

    const showPreview = (payment: Payment) => {
        setSelectedPayment(payment);
        setPreviewVisible(true);
    };

    useEffect(() => {
        loadPayments();
    }, []);

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
                                <TeamOutlined className="mr-2 text-[#6B8E23]" />
                                Pending Transactions
                            </Title>
                            <Text type="secondary" className="text-gray-600">
                                {payments.length} transaksi menunggu persetujuan
                            </Text>
                        </div>

                        {/* Pending Transactions List */}
                        <div className="space-y-3 mb-6">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="text-gray-500">Memuat data...</div>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-4">
                                    <div className="text-gray-500">
                                        <TeamOutlined className="text-2xl mb-2" />
                                        <div>Tidak ada pembayaran yang menunggu persetujuan</div>
                                    </div>
                                </div>
                            ) : (
                                payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => showPreview(payment)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 flex-1">
                                                {/* <Avatar
                                                    size={40}
                                                    icon={<UserOutlined />}
                                                    className="bg-[#6B8E23]"
                                                /> */}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[#001F54] text-sm">
                                                        {payment.siswa?.nama || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Kelas: {payment.siswa?.kelas || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                                                        <CalendarOutlined className="text-[#6B8E23]" />
                                                        <span>
                                                            {dayjs(payment.startMonth).format('MMM YYYY')} - {dayjs(payment.endMonth).format('MMM YYYY')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600 text-sm">
                                                    Rp {payment.amount.toLocaleString('id-ID')}
                                                </div>
                                                <div className="mt-2">
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        className="bg-blue-600 border-blue-600 hover:bg-blue-700 text-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            showPreview(payment);
                                                        }}
                                                    >
                                                        View Detail
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Back Button */}
                        <div className="mb-0">
                            <Link href="/admin/266008">
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

                    {/* Preview Modal */}
                    <Modal
                        title={
                            <div className="flex items-center space-x-2">
                                <FileImageOutlined className="text-[#6B8E23]" />
                                <span>Detail Pembayaran</span>
                            </div>
                        }
                        open={previewVisible}
                        onCancel={() => setPreviewVisible(false)}
                        width={800}
                        footer={null}
                        className="rounded-2xl"
                    >
                        {selectedPayment && (
                            <div>
                                {/* Siswa */}
                                <div className="mb-4">
                                    <Text strong className="text-[#001F54]">Siswa:</Text>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <UserOutlined className="text-[#6B8E23]" />
                                        <div>
                                            <div className="font-medium">{selectedPayment.siswa?.nama || 'N/A'} - {selectedPayment.siswa?.kelas || 'N/A'}</div>
                                            {/* <div className="text-sm text-gray-500">{selectedPayment.siswa?.kelas || 'N/A'}</div> */}
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-4">
                                    <Text strong className="text-[#001F54]">Status:</Text>
                                    <div className="mt-1">
                                        <Tag color="orange">Menunggu Persetujuan</Tag>
                                    </div>
                                </div>

                                {/* Periode */}
                                <div className="mb-4">
                                    <Text strong className="text-[#001F54]">Periode:</Text>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <CalendarOutlined className="text-[#6B8E23]" />
                                        <div>
                                            {dayjs(selectedPayment.startMonth).format('MMMM YYYY')} - {dayjs(selectedPayment.endMonth).format('MMMM YYYY')}
                                        </div>
                                    </div>
                                </div>

                                {/* Jumlah */}
                                <div className="mb-4">
                                    <Text strong className="text-[#001F54]">Jumlah:</Text>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {/* <DollarOutlined className="text-[#6B8E23]" /> */}
                                        <span className="text-lg font-semibold text-green-600">
                                            Rp {selectedPayment.amount.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {/* Bukti Transfer */}
                                <div className="mb-4">
                                    <Text strong className="text-[#001F54]">Bukti Transfer:</Text>
                                    <div className="mt-2">
                                        <Image
                                            src={`/${selectedPayment.filePath}`}
                                            alt="Bukti Transfer"
                                            className="rounded-lg border"
                                            style={{ maxHeight: '400px' }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={() => updatePaymentStatus(selectedPayment.id, 'APPROVED')}
                                        className="bg-green-600 border-green-600 hover:bg-green-700"
                                    >
                                        Setujui
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                            setPreviewVisible(false);
                                            handleReject(selectedPayment);
                                        }}
                                    >
                                        Tolak
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Rejection Modal */}
                    <Modal
                        title={
                            <div className="flex items-center space-x-2">
                                <CloseOutlined className="text-red-500" />
                                <span>Tolak Pembayaran</span>
                            </div>
                        }
                        open={rejectModalVisible}
                        onCancel={() => {
                            setRejectModalVisible(false);
                            rejectForm.resetFields();
                        }}
                        footer={null}
                        className="rounded-2xl"
                    >
                        {selectedPayment && (
                            <div>
                                <div className="mb-4">
                                    <Text strong className="text-[#001F54]">Siswa:</Text>
                                    <div className="mt-1">
                                        <div className="font-medium">{selectedPayment.siswa?.nama || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{selectedPayment.siswa?.kelas || 'N/A'}</div>
                                    </div>
                                </div>

                                <Form
                                    form={rejectForm}
                                    layout="vertical"
                                    onFinish={handleRejectSubmit}
                                >
                                    <Form.Item
                                        label="Alasan Penolakan"
                                        name="reason"
                                        rules={[{ required: true, message: 'Masukkan alasan penolakan!' }]}
                                    >
                                        <TextArea
                                            rows={4}
                                            placeholder="Masukkan alasan mengapa pembayaran ditolak..."
                                        />
                                    </Form.Item>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            onClick={() => {
                                                setRejectModalVisible(false);
                                                rejectForm.resetFields();
                                            }}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="primary"
                                            danger
                                            htmlType="submit"
                                            icon={<CloseOutlined />}
                                        >
                                            Tolak Pembayaran
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </ConfigProvider>
    );
}
