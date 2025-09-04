"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "antd";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-[#001F54] to-[#6B8E23] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo/abu-dzar-logo.png"
            alt="Abu Dzar Logo"
            width={200}
            height={200}
            priority
            className="mx-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#001F54] mb-4">
          Kartu Iuran Digital
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Sistem pembayaran iuran sekolah yang mudah dan praktis
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-6">
          <Link href="/bayar-iuran">
            <Button
              type="primary"
              size="large"
              className="w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-full"
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
              Bayar Iuran Sekarang
            </Button>
          </Link>

        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Pilih menu di atas untuk pembayaran atau melihat status iuran</p>
        </div>
      </div>
    </div>
  );
}
