'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Select,
    Button,
    Upload,
    message,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Tag,
    DatePicker,
    Image,
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    UploadOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    FileImageOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

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

// API function to fetch approved payments for a student
const fetchApprovedPayments = async (siswaId: string) => {
    const response = await fetch(`/api/payments?siswaId=${siswaId}&approvedOnly=true`);
    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Failed to fetch approved payments');
    }

    return result.data;
};

const { RangePicker } = DatePicker;

// Monthly fee amount (in IDR)
const MONTHLY_FEE = 30000;

// Set dayjs locale to Indonesian
dayjs.locale('id');

interface Student {
    id: string;
    nama: string;
    kelas: string;
    jenis_kelamin: string;
}

interface PaymentFormData {
    kelas: string;
    siswa: string;
    selectedMonths: string[];
    amount: number;
    receipt: UploadFile[];
}

interface ApprovedPayment {
    id: string;
    startMonth: string;
    endMonth: string;
    status: string;
}

export default function BayarIuranPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [approvedPayments, setApprovedPayments] = useState<ApprovedPayment[]>([]);
    // const [approvedPaymentsLoading, setApprovedPaymentsLoading] = useState(false);

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

    // Fetch approved payments when student is selected
    useEffect(() => {
        const loadApprovedPayments = async () => {
            if (!selectedStudent) {
                setApprovedPayments([]);
                return;
            }

            // setApprovedPaymentsLoading(true);

            try {
                const payments = await fetchApprovedPayments(selectedStudent);
                setApprovedPayments(payments);
            } catch (error) {
                console.error('Error loading approved payments:', error);
                setApprovedPayments([]);
            } finally {
                // setApprovedPaymentsLoading(false);
            }
        };

        loadApprovedPayments();
    }, [selectedStudent]);

    // Calculate total amount
    const totalAmount = selectedMonths.length * MONTHLY_FEE;

    // Get list of paid months from approved payments
    const getPaidMonths = (): string[] => {
        const paidMonths: string[] = [];

        approvedPayments.forEach(payment => {
            const startDate = dayjs(payment.startMonth);
            const endDate = dayjs(payment.endMonth);

            let current = startDate.clone();
            while (current.isBefore(endDate, 'month') || current.isSame(endDate, 'month')) {
                paidMonths.push(current.format('YYYY-MM'));
                current = current.add(1, 'month');
            }
        });

        return paidMonths;
    };

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        setSelectedStudent('');
        setApprovedPayments([]);
        form.setFieldsValue({ siswa: undefined });
    };

    const handleStudentChange = (value: string) => {
        setSelectedStudent(value);
        form.setFieldsValue({ siswa: value });
    };

    const handleMonthChange = (dates: any) => {
        if (dates && dates.length === 2) {
            const startDate = dates[0];
            const endDate = dates[1];
            const months = [];

            let current = startDate.clone();
            while (current.isBefore(endDate, 'month') || current.isSame(endDate, 'month')) {
                months.push(current.format('YYYY-MM'));
                current = current.add(1, 'month');
            }

            setSelectedMonths(months);
            form.setFieldsValue({ amount: months.length * MONTHLY_FEE });
        } else {
            setSelectedMonths([]);
            form.setFieldsValue({ amount: 0 });
        }
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Hanya file gambar yang diperbolehkan!');
                return false;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ukuran gambar harus kurang dari 5MB!');
                return false;
            }

            return false; // Prevent auto upload
        },
        onChange: (info) => {
            setFileList(info.fileList);
        },
        fileList,
        maxCount: 1,
        listType: 'picture-card',
        showUploadList: {
            showPreviewIcon: true,
            showRemoveIcon: true,
            showDownloadIcon: false,
        },
        onPreview: handlePreview,
    };

    const onFinish = async (values: PaymentFormData) => {
        if (selectedMonths.length === 0) {
            message.error('Pilih minimal satu bulan untuk pembayaran!');
            return;
        }

        if (fileList.length === 0) {
            message.error('Upload bukti transfer terlebih dahulu!');
            return;
        }

        setLoading(true);

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('siswaId', values.siswa);
            formData.append('startMonth', selectedMonths[0]);
            formData.append('endMonth', selectedMonths[selectedMonths.length - 1]);
            formData.append('file', fileList[0].originFileObj as File);

            // Submit to API
            const response = await fetch('/api/payments', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Gagal mengirim pembayaran');
            }

            message.success('Pembayaran berhasil disubmit! Status: PENDING');

            // Redirect to status page
            router.push(`/bayar-iuran/${result.data.id}/status`);

        } catch (error) {
            console.error('Payment submission error:', error);
            message.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat submit pembayaran!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full mx-4">
                    <style jsx global>{`
                    .ant-picker-dropdown {
                        z-index: 9999 !important;
                    }
                    .ant-picker-panel-container {
                        width: 100% !important;
                        max-width: 90vw !important;
                    }
                    .ant-picker-panel {
                        width: 100% !important;
                    }
                    .ant-picker-month-panel {
                        width: 100% !important;
                    }
                    .ant-picker-month-panel .ant-picker-content {
                        width: 100% !important;
                    }
                    .ant-picker-month-panel .ant-picker-cell {
                        width: 25% !important;
                        min-width: 60px !important;
                    }
                    /* Desktop styles - allow normal positioning */
                    @media (min-width: 769px) {
                        .ant-picker-dropdown {
                            position: absolute !important;
                            left: auto !important;
                            transform: none !important;
                            width: auto !important;
                            max-width: none !important;
                        }
                        .ant-picker-panel-container {
                            width: auto !important;
                            max-width: none !important;
                        }
                        .ant-picker-panel {
                            width: auto !important;
                        }
                        .ant-picker-month-panel {
                            width: auto !important;
                        }
                        .ant-picker-month-panel .ant-picker-content {
                            width: auto !important;
                        }
                        .ant-picker-month-panel .ant-picker-cell {
                            width: auto !important;
                            min-width: 60px !important;
                        }
                    }
                    /* Mobile styles - keep existing mobile behavior */
                    @media (max-width: 768px) {
                        .ant-picker-dropdown {
                            left: 50% !important;
                            transform: translateX(-50%) !important;
                            width: 90vw !important;
                            max-width: 90vw !important;
                        }
                        .ant-picker-month-panel .ant-picker-cell {
                            width: 25% !important;
                            min-width: 50px !important;
                            font-size: 12px !important;
                        }
                    }
                `}</style>
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
                                <DollarOutlined className="mr-2 text-[#6B8E23]" />
                                Bayar Iuran
                            </Title>
                            <Text type="secondary" className="text-gray-600">
                                Formulir pembayaran iuran sekolah
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
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

                            {/* Month Range Selection */}
                            <Form.Item
                                label={
                                    <Space>
                                        <CalendarOutlined className="text-[#6B8E23]" />
                                        <span>Periode Pembayaran</span>
                                    </Space>
                                }
                                name="periode"
                                rules={[{ required: true, message: 'Pilih periode pembayaran!' }]}
                            >
                                <RangePicker
                                    picker="month"
                                    placeholder={
                                        !selectedClass || !selectedStudent
                                            ? ['Pilih kelas dan siswa terlebih dahulu', 'Pilih kelas dan siswa terlebih dahulu']
                                            : ['Mulai bulan', 'Sampai bulan']
                                    }
                                    size="large"
                                    onChange={handleMonthChange}
                                    disabled={!selectedClass || !selectedStudent}
                                    disabledDate={(current) => {
                                        if (!current) return false;

                                        // Disable dates outside July 2025 to June 2026
                                        const july2025 = dayjs('2025-07-01');
                                        const june2026 = dayjs('2026-06-30');
                                        if (current.isBefore(july2025, 'month') || current.isAfter(june2026, 'month')) {
                                            return true;
                                        }

                                        // Disable months that are already paid (APPROVED status)
                                        if (selectedStudent) {
                                            const paidMonths = getPaidMonths();
                                            const currentMonth = current.format('YYYY-MM');
                                            return paidMonths.includes(currentMonth);
                                        }

                                        return false;
                                    }}
                                    format="MMMM YYYY"
                                    style={{ width: '100%' }}
                                    getPopupContainer={() => document.body}
                                />
                            </Form.Item>

                            {/* Show paid months info */}
                            {selectedStudent && approvedPayments.length > 0 && (
                                <Card size="small" className="bg-blue-50 border-blue-200 rounded-2xl">
                                    <div className="text-center">
                                        <Text type="secondary" className="text-sm">
                                            <CheckCircleOutlined className="text-green-500 mr-1" />
                                            <strong>Bulan yang sudah dibayar:</strong>
                                        </Text>
                                        <div className="mt-2">
                                            {getPaidMonths().map((month, index) => (
                                                <Tag key={index} color="green" className="mr-1 mb-1">
                                                    {dayjs(month).format('MMMM YYYY')}
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Amount Display */}
                            {selectedMonths.length > 0 && (
                                <Card size="small" className="bg-[#6B8E23]/10 border-[#6B8E23]/20 rounded-2xl">
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Text strong className="text-[#001F54]">Total Pembayaran:</Text>
                                        </Col>
                                        <Col>
                                            <Text strong className="text-lg text-[#6B8E23]">
                                                Rp {totalAmount.toLocaleString('id-ID')}
                                            </Text>
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="mt-1">
                                        <Col>
                                            <Text type="secondary" className="text-sm">
                                                {selectedMonths.length} bulan × Rp {MONTHLY_FEE.toLocaleString('id-ID')}
                                            </Text>
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="mt-1">
                                        <Col>
                                            <Text type="secondary" className="text-xs">
                                                Periode: {dayjs(selectedMonths[0]).format('MMMM YYYY')} - {dayjs(selectedMonths[selectedMonths.length - 1]).format('MMMM YYYY')}
                                            </Text>
                                        </Col>
                                    </Row>
                                </Card>
                            )}

                            {/* Receipt Upload */}
                            <Form.Item
                                label={
                                    <Space>
                                        <FileImageOutlined className="text-[#6B8E23]" />
                                        <span>Upload Bukti Transfer</span>
                                    </Space>
                                }
                                name="receipt"
                                rules={[{ required: true, message: 'Upload bukti transfer!' }]}
                                extra={
                                    <div className="text-xs text-gray-500 mt-1">
                                        Max 5MB, format: JPG, PNG
                                    </div>
                                }
                            >
                                <Upload {...uploadProps}>
                                    {fileList.length >= 1 ? null : (
                                        <div className="text-center p-2">
                                            <UploadOutlined className="text-xl text-[#6B8E23] mb-2" />
                                            <div className="text-xs text-[#001F54]">
                                                Upload
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                            <div className="text-center">
                                <Text type="secondary" className="text-sm text-[#001F54]">
                                    💡 <strong>Tips:</strong> Pastikan bukti transfer jelas dan dapat dibaca
                                </Text>
                            </div>
                            <Divider />

                            {/* Submit Button */}
                            <Form.Item className="mb-4">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    block
                                    loading={loading}
                                    icon={<CheckCircleOutlined />}
                                    className="h-12 text-base font-medium rounded-full"
                                    style={{
                                        backgroundColor: '#6B8E23',
                                        borderColor: '#6B8E23',
                                        boxShadow: '0 4px 12px rgba(107, 142, 35, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#5a7a1f';
                                        e.currentTarget.style.borderColor = '#5a7a1f';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#6B8E23';
                                        e.currentTarget.style.borderColor = '#6B8E23';
                                    }}
                                >
                                    {loading ? 'Mengirim...' : 'Submit Pembayaran'}
                                </Button>
                            </Form.Item>

                            {/* Back Button */}
                            <Form.Item className="mb-0">
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
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Info Card */}
                    {/* <Card size="small" className="mt-4 bg-white/90 border-[#6B8E23]/20 rounded-2xl shadow-lg">
                        <div className="text-center">
                            <Text type="secondary" className="text-sm text-[#001F54]">
                                💡 <strong>Tips:</strong> Pastikan bukti transfer jelas dan dapat dibaca
                            </Text>
                        </div>
                    </Card> */}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
        </ConfigProvider>
    );
}
