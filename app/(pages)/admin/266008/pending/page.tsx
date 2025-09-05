'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    message,
    Modal,
    Form,
    Input,
    Image,
} from 'antd';
import {
    TeamOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckOutlined,
    CloseOutlined,
    FileImageOutlined,
    EyeOutlined,
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

// Force dynamic rendering - this page should not be statically generated
export const dynamic = 'force-dynamic';

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
            const errorMsg = error instanceof Error ? error.message : String(error);
            message.error(`Terjadi kesalahan saat memuat data: ${errorMsg}`);
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
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            message.error(`Terjadi kesalahan saat memperbarui status: ${errorMsg}`);
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
                                                    {/* <div className="flex items-center space-x-1 text-xs text-gray-600">
                                                        <CalendarOutlined className="text-[#6B8E23]" />
                                                        <span>
                                                            {payment.startMonth} - {payment.endMonth}
                                                        </span>
                                                    </div> */}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600 text-sm">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0
                                                    }).format(payment.amount)}
                                                </div>
                                                <div className="mt-2">
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<EyeOutlined />}
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
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                                <FileImageOutlined className="text-[#6B8E23] text-lg" />
                                <span className="text-lg font-semibold text-[#001F54]">Detail Pembayaran</span>
                            </div>
                        }
                        open={previewVisible}
                        onCancel={() => setPreviewVisible(false)}
                        width={700}
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
                                <div className="py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-[#6B8E23] rounded-full flex items-center justify-center">
                                            <UserOutlined className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-base font-semibold text-[#001F54]">
                                                {selectedPayment.siswa?.nama || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Kelas {selectedPayment.siswa?.kelas || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="py-3 space-y-3">
                                    {/* Status and Period */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                                            <div className="text-xs text-gray-500 mb-1">Status</div>
                                            <div className="text-xs text-orange-600 font-medium">
                                                Menunggu Persetujuan
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                                            <div className="text-xs text-gray-500 mb-1">Periode</div>
                                            <div className="text-xs font-medium text-[#001F54]">
                                                {dayjs(selectedPayment.startMonth).format('MMM YYYY')} - {dayjs(selectedPayment.endMonth).format('MMM YYYY')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Jumlah Pembayaran</div>
                                        <div className="text-xl font-bold text-green-600">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }).format(selectedPayment.amount)}
                                        </div>
                                    </div>

                                    {/* Bukti Transfer */}
                                    <div>
                                        <div className="text-sm font-medium text-[#001F54] mb-2">Bukti Transfer</div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <Image
                                                src={selectedPayment.filePath}
                                                alt="Bukti Transfer"
                                                className="w-full"
                                                style={{ maxHeight: '250px', objectFit: 'contain' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="py-3 border-t border-gray-100rounded-b-xl">
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
                            </div>
                        )}
                    </Modal>

                    {/* Rejection Modal */}
                    <Modal
                        title={
                            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                                <CloseOutlined className="text-red-500 text-xl" />
                                <span className="text-xl font-semibold text-[#001F54]">Tolak Pembayaran</span>
                            </div>
                        }
                        open={rejectModalVisible}
                        onCancel={() => {
                            setRejectModalVisible(false);
                            rejectForm.resetFields();
                        }}
                        footer={null}
                        className="rounded-xl"
                        styles={{
                            header: {
                                borderBottom: 'none',
                                paddingBottom: '0',
                                marginBottom: '0',
                                paddingLeft: '16px',
                                paddingRight: '16px'
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
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                            <UserOutlined className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-base font-semibold text-[#001F54]">
                                                {selectedPayment.siswa?.nama || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Kelas {selectedPayment.siswa?.kelas || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="px-4 py-3">
                                    <Form
                                        form={rejectForm}
                                        layout="vertical"
                                        onFinish={handleRejectSubmit}
                                    >
                                        <Form.Item
                                            label={
                                                <div className="flex items-center space-x-1">
                                                    <span className="font-medium text-[#001F54]">Alasan Penolakan</span>
                                                    <span className="text-red-500">*</span>
                                                </div>
                                            }
                                            name="reason"
                                            rules={[{ required: true, message: 'Masukkan alasan penolakan!' }]}
                                        >
                                            <TextArea
                                                rows={3}
                                                placeholder="Masukkan alasan mengapa pembayaran ditolak..."
                                                className="rounded-lg"
                                            />
                                        </Form.Item>
                                    </Form>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
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
                                            onClick={() => rejectForm.submit()}
                                        >
                                            Tolak Pembayaran
                                        </Button>
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
