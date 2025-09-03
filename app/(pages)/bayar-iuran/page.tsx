'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Select,
    Input,
    Button,
    Upload,
    message,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Tag,
    Modal,
    Spin,
    DatePicker,
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    UploadOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    FileImageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import type { UploadFile, UploadProps } from 'antd';

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

export default function BayarIuranPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState<string>('');

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

    // Calculate total amount
    const totalAmount = selectedMonths.length * MONTHLY_FEE;

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        form.setFieldsValue({ siswa: undefined });
    };

    const handleMonthChange = (dates: any, dateStrings: string[]) => {
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
        },
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            message.success('Pembayaran berhasil disubmit!');

            // Reset form
            form.resetFields();
            setSelectedClass('');
            setFilteredStudents([]);
            setSelectedMonths([]);
            setFileList([]);

        } catch (error) {
            message.error('Terjadi kesalahan saat submit pembayaran!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
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
                    @media (max-width: 480px) {
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
                    <Card className="shadow-lg">
                        <div className="text-center mb-6">
                            <Title level={3} className="!mb-2">
                                <DollarOutlined className="mr-2 text-green-600" />
                                Bayar Iuran
                            </Title>
                            <Text type="secondary">
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
                                        <TeamOutlined className="text-blue-600" />
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
                                        <UserOutlined className="text-blue-600" />
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
                                        <CalendarOutlined className="text-blue-600" />
                                        <span>Periode Pembayaran</span>
                                    </Space>
                                }
                                name="periode"
                                rules={[{ required: true, message: 'Pilih periode pembayaran!' }]}
                            >
                                <RangePicker
                                    picker="month"
                                    placeholder={['Mulai bulan', 'Sampai bulan']}
                                    size="large"
                                    onChange={handleMonthChange}
                                    disabledDate={(current) => {
                                        // Disable dates outside July 2025 to June 2026
                                        const july2025 = dayjs('2025-07-01');
                                        const june2026 = dayjs('2026-06-30');
                                        return current && (current.isBefore(july2025, 'month') || current.isAfter(june2026, 'month'));
                                    }}
                                    format="MMMM YYYY"
                                    style={{ width: '100%' }}
                                    popupStyle={{
                                        width: '100%',
                                        maxWidth: '90vw',
                                        left: '50% !important',
                                        transform: 'translateX(-50%)',
                                        position: 'fixed'
                                    }}
                                    getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                />
                            </Form.Item>

                            {/* Amount Display */}
                            {selectedMonths.length > 0 && (
                                <Card size="small" className="bg-green-50 border-green-200">
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Text strong>Total Pembayaran:</Text>
                                        </Col>
                                        <Col>
                                            <Text strong className="text-lg text-green-600">
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
                                                Periode: {selectedMonths[0]} - {selectedMonths[selectedMonths.length - 1]}
                                            </Text>
                                        </Col>
                                    </Row>
                                </Card>
                            )}

                            {/* Receipt Upload */}
                            <Form.Item
                                label={
                                    <Space>
                                        <FileImageOutlined className="text-blue-600" />
                                        <span>Upload Bukti Transfer</span>
                                    </Space>
                                }
                                name="receipt"
                                rules={[{ required: true, message: 'Upload bukti transfer!' }]}
                            >
                                <Upload {...uploadProps}>
                                    {fileList.length >= 1 ? null : (
                                        <div className="text-center">
                                            <UploadOutlined className="text-2xl text-gray-400 mb-2" />
                                            <div className="text-sm text-gray-500">
                                                Klik untuk upload gambar
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Max 5MB, format: JPG, PNG
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Divider />

                            {/* Submit Button */}
                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    block
                                    loading={loading}
                                    icon={<CheckCircleOutlined />}
                                    className="h-12 text-base font-medium"
                                >
                                    {loading ? 'Mengirim...' : 'Submit Pembayaran'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Info Card */}
                    <Card size="small" className="mt-4 bg-blue-50 border-blue-200">
                        <div className="text-center">
                            <Text type="secondary" className="text-sm">
                                💡 <strong>Tips:</strong> Pastikan bukti transfer jelas dan dapat dibaca
                            </Text>
                        </div>
                    </Card>
                </div>
            </div>
        </ConfigProvider>
    );
}
