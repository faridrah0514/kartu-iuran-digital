'use client';

import React from 'react';
import {
    Card,
    Button,
    Typography,
} from 'antd';
import {
    TeamOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/id_ID';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function AdminPage() {
    const router = useRouter();



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
                                Admin Dashboard
                            </Title>
                            <Text type="secondary" className="text-gray-600">
                                Kelola pembayaran iuran sekolah
                            </Text>
                        </div>

                        {/* Pending Transaction Button */}
                        <div className="mb-4">
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<TeamOutlined />}
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
                                onClick={() => router.push('/admin/266008/pending')}
                            >
                                Pending Transaction
                            </Button>
                        </div>

                        {/* Back Button */}
                        <div className="mb-0">
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
