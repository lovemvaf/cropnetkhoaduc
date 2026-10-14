'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Container } from '@cropnet/ui';
import { Compass, MapPin } from 'lucide-react';

// Dynamic import with ssr: false to guarantee zero SSR hydration issues with Leaflet
const InteractiveDongNaiMap = dynamic(
  () => import('@/features/map/InteractiveDongNaiMap'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-[#E2E5DC] p-12 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#2C4939] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[#647067] font-medium">Đang tải bản đồ nông nghiệp số Thành phố Đồng Nai...</p>
      </div>
    )
  }
);

export default function CooperativeMapPage() {
  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8 max-w-7xl">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E2E5DC] pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
              Bản Đồ Nông Nghiệp Số
            </span>
            <span className="text-[#CBD0C4]">•</span>
            <span className="text-xs text-[#8C978F]">Hệ quy chiếu WGS84</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#253129] tracking-tight">
            Vùng Trồng Nông Sản & Hợp Tác Xã Thành Phố Đồng Nai
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] max-w-3xl leading-relaxed">
            Hệ thống bản đồ số địa lý toàn diện bao phủ toàn bộ địa giới hiện hành Thành phố Đồng Nai (thành lập theo Nghị quyết 30/2026/QH16, bao gồm không gian tỉnh Đồng Nai và Bình Phước trước sáp nhập). 
            Tích hợp phân tầng 3 cấp: Vùng lãnh thổ nông nghiệp truyền thống (Tâm tham khảo), Hợp tác xã/nhà vườn xác minh hồ sơ và Lô hàng truy xuất tem QR thực tế.
          </p>
        </div>

        {/* Real Interactive Map Component */}
        <InteractiveDongNaiMap />
      </Container>
    </div>
  );
}
