'use client';

import React, { useState } from 'react';
import { Container } from '@cropnet/ui';
import { Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CropSeason {
  id: string;
  cropName: string;
  cooperative: string;
  area: string;
  peakMonths: number[];
  harvestStatus: string;
  brixRating: string;
  tasteProfile: string;
  farmingNote: string;
  imageUrl: string;
  productId: string;
}

export default function SeasonalCalendarPage() {
  const currentMonth = 10; // October
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const seasons: CropSeason[] = [
    {
      id: 'buoi-duong-la-cam',
      cropName: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
      cooperative: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      area: 'Phường Tân Triều, Thành phố Đồng Nai',
      peakMonths: [9, 10, 11, 12],
      harvestStatus: 'Đang vào chính vụ (Cao điểm thu hoạch)',
      brixRating: '11.5 - 12.5 Brix',
      tasteProfile: 'Tép mọng nước vàng óng, ngọt thanh đậm, róc vỏ, không the đắng',
      farmingNote: 'Bao trái bằng túi màng thoáng khí, tưới nước phù sa sông Đồng Nai.',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
      productId: 'prod-buoi-duong-la-cam'
    },
    {
      id: 'saurieng-ri6',
      cropName: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
      cooperative: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
      area: 'Phường Xuân Lập, Thành phố Đồng Nai',
      peakMonths: [5, 6, 7, 8, 10, 11],
      harvestStatus: 'Đang thu hoạch già chín cây',
      brixRating: '26.0 - 28.5 Brix',
      tasteProfile: 'Cơm vàng dẻo béo ngậy, hạt lép, mùi thơm nồng tự nhiên',
      farmingNote: 'Gõ bộng thu hái già trên cây hoặc tự rụng, không nhúng thuốc kích chín.',
      imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&auto=format',
      productId: 'prod-saurieng-ri6-longkhanh'
    },
    {
      id: 'chomchom-nhan',
      cropName: 'Chôm Chôm Nhãn Long Khánh',
      cooperative: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
      area: 'Phường Xuân Lập, Thành phố Đồng Nai',
      peakMonths: [5, 6, 7, 8, 10, 11],
      harvestStatus: 'Đang hái tươi giao trong ngày',
      brixRating: '18.0 - 20.0 Brix',
      tasteProfile: 'Cùi dày giòn tróc hạt, vị ngọt thanh tự nhiên',
      farmingNote: 'Thu hái sáng sớm, chuyển thẳng về kho mát bảo quản.',
      imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format',
      productId: 'prod-chom-chom-nhan'
    },
    {
      id: 'buoi-da-xanh',
      cropName: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
      cooperative: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      area: 'Phường Tân Triều, Thành phố Đồng Nai',
      peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestStatus: 'Thu hoạch rải vụ quanh năm',
      brixRating: '10.5 - 11.5 Brix',
      tasteProfile: 'Ruột hồng đào, tép giòn mọng, vị ngọt thanh',
      farmingNote: 'Bón phân hữu cơ vi sinh tự ủ từ bã cà phê và trấu.',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
      productId: 'prod-buoi-da-xanh'
    },
    {
      id: 'hatdieu-dongnai',
      cropName: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
      cooperative: 'HTX Nông Nghiệp Long Khánh',
      area: 'TP Long Khánh, Thành phố Đồng Nai',
      peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestStatus: 'Sẵn hàng chế biến đóng hộp',
      brixRating: 'Hạt tuyển chọn loại 1',
      tasteProfile: 'Bùi béo giòn thơm, mằn mặn dịu nhẹ',
      farmingNote: 'Rang củi truyền thống giữ nguyên vỏ lụa bảo vệ hạt.',
      imageUrl: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=800&auto=format',
      productId: 'prod-hat-dieu-rang-cui'
    }
  ];

  const activeCropsInMonth = seasons.filter(s => s.peakMonths.includes(selectedMonth));

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8 max-w-6xl">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E2E5DC] pb-6 space-y-2">
          <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
            Niên Vụ Cây Ăn Trái
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight">
            Lịch Mùa Vụ Thu Hoạch Nông Sản Thành Phố Đồng Nai
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] max-w-3xl leading-relaxed">
            Theo dõi thời điểm chín tự nhiên của bưởi Cù lao Tân Triều, sầu riêng và chôm chôm Long Khánh để thưởng thức đúng độ ngon nhất và đặt trước với nhà vườn.
          </p>
        </div>

        {/* 12-Month Selector */}
        <div className="bg-white rounded-xl border border-[#E2E5DC] p-5 shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-[#647067]">
            <span className="font-semibold text-[#253129]">Chọn tháng trong năm:</span>
            <span className="bg-[#E6EAE4] text-[#2C4939] px-2.5 py-0.5 rounded font-medium">
              Thời điểm hiện tại: Tháng {currentMonth} (Vụ thu hoạch bưởi Tân Triều)
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5 pt-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`py-2 rounded-lg text-xs font-medium transition-colors border text-center ${
                  selectedMonth === m
                    ? 'bg-[#2C4939] border-[#2C4939] text-white'
                    : m === currentMonth
                    ? 'bg-[#FAF9F5] border-[#CBD0C4] text-[#2C4939] font-semibold'
                    : 'bg-white border-[#E2E5DC] text-[#647067] hover:bg-[#F1EFE8]'
                }`}
              >
                Tháng {m}
              </button>
            ))}
          </div>
        </div>

        {/* Crops in Selected Month */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#253129]">
              Nông sản vào vụ trong Tháng {selectedMonth} ({activeCropsInMonth.length} loại)
            </h2>
            <span className="text-xs text-[#8C978F]">Dữ liệu cập nhật từ HTX</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCropsInMonth.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl border border-[#E2E5DC] overflow-hidden flex flex-col justify-between hover:border-[#CBD0C4] transition-colors"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#F1EFE8] relative overflow-hidden">
                    <img
                      src={crop.imageUrl}
                      alt={crop.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white/95 text-[#2C4939] text-[11px] font-medium px-2 py-0.5 rounded border border-[#E2E5DC]">
                      Độ ngọt: {crop.brixRating}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[11px] text-[#7B876C] font-medium">
                        {crop.cooperative}
                      </span>
                      <h3 className="font-semibold text-sm sm:text-base text-[#253129] mt-0.5 leading-snug">
                        {crop.cropName}
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#647067] bg-[#FAF9F5] p-3 rounded-lg border border-[#E2E5DC]">
                      <p className="font-medium text-[#2C4939]">
                        • {crop.harvestStatus}
                      </p>
                      <p className="text-[11px]">
                        <strong>Hương vị:</strong> {crop.tasteProfile}
                      </p>
                      <p className="text-[11px]">
                        <strong>Kỹ thuật canh tác:</strong> {crop.farmingNote}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/products/${crop.productId}`}
                    className="w-full bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#E2E5DC]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#7B876C]" />
                    <span>Xem chi tiết nông sản</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-order Callout (Editorial & Clean) */}
        <div className="bg-[#F1EFE8] border border-[#E2E5DC] p-6 sm:p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
              Chính Sách Đặt Trước Vụ Mùa
            </span>
            <h3 className="text-lg font-bold text-[#253129]">
              Đặt trước Bưởi đường lá cam và Sầu riêng vụ Tết 2026
            </h3>
            <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
              Các Hợp tác xã mở cổng ghi nhận đặt trước lô bưởi cành lộc tuyển chọn và sầu riêng chín cây cho khách hàng và doanh nghiệp. Đảm bảo giữ đúng giá tại vườn và giao hàng đúng hẹn.
            </p>
          </div>

          <Link
            href="/ai-tu-van"
            className="bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
          >
            Tư vấn đặt trước
          </Link>
        </div>
      </Container>
    </div>
  );
}
