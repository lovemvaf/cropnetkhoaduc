'use client';

import React, { useState } from 'react';
import { Container, Card, Badge, Button } from '@cropnet/ui';
import { 
  Calendar, Leaf, Sun, Droplets, Sparkles, Award, ArrowRight, 
  Clock, CheckCircle2, ChevronRight, ShoppingBag 
} from 'lucide-react';
import Link from 'next/link';

interface CropSeason {
  id: string;
  cropName: string;
  cooperative: string;
  area: string;
  peakMonths: number[]; // 1 to 12
  harvestStatus: string;
  brixRating: string;
  tasteProfile: string;
  farmingNote: string;
  imageUrl: string;
  productId: string;
}

export default function SeasonalCalendarPage() {
  const currentMonth = 10; // October (2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const seasons: CropSeason[] = [
    {
      id: 'buoi-duong-la-cam',
      cropName: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
      cooperative: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      area: 'Xã Tân Bình, Vĩnh Cửu, TP Đồng Nai',
      peakMonths: [9, 10, 11, 12],
      harvestStatus: 'Đang vào vụ chính (Cao điểm biếu Tết)',
      brixRating: '11.5 - 12.5 Brix',
      tasteProfile: 'Tép vàng óng mọng nước, ngọt thanh đậm, róc vỏ, không the đắng',
      farmingNote: 'Bao trái bằng túi thoáng khí chống ruồi vàng, tưới nước phù sa sông Đồng Nai.',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
      productId: '1'
    },
    {
      id: 'saurieng-ri6',
      cropName: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
      cooperative: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
      area: 'Phường Xuân Lập, TP Long Khánh, TP Đồng Nai',
      peakMonths: [5, 6, 7, 8, 10, 11],
      harvestStatus: 'Đang thu hoạch già chín cây (Vụ nghịch chọn lọc)',
      brixRating: '26.0 - 28.5 Brix',
      tasteProfile: 'Cơm vàng óng dẻo béo ngậy, hạt lép, mùi thơm nồng nàn tự nhiên',
      farmingNote: 'Cam kết gõ bộng thu hái già trên cây hoặc tự rụng, tuyệt đối không nhúng thuốc kích chín ép.',
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format',
      productId: '3'
    },
    {
      id: 'chomchom-nhan',
      cropName: 'Chôm Chôm Nhãn Long Khánh',
      cooperative: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
      area: 'Vùng đất đỏ Bazan Xuân Lập, TP Long Khánh',
      peakMonths: [5, 6, 7, 8, 10, 11],
      harvestStatus: 'Đang hái tươi giao trong ngày',
      brixRating: '18.0 - 20.0 Brix',
      tasteProfile: 'Cùi dày giòn tróc hạt, vị ngọt đậm thơm mát',
      farmingNote: 'Canh tác sinh thái không phun thuốc bảo quản sau thu hái, chuyển thẳng từ vườn về kho mát.',
      imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format',
      productId: '4'
    },
    {
      id: 'buoi-da-xanh',
      cropName: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
      cooperative: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      area: 'Cù lao Tân Triều, Vĩnh Cửu, TP Đồng Nai',
      peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestStatus: 'Thu hoạch rải vụ đều quanh năm',
      brixRating: '10.5 - 11.5 Brix',
      tasteProfile: 'Ruột hồng đào, tép giòn không dính tay, giải nhiệt thanh khiết',
      farmingNote: 'Bón phân hữu cơ vi sinh tự ủ từ bã cà phê và trấu mục.',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
      productId: '2'
    },
    {
      id: 'hatdieu-dongnai',
      cropName: 'Hạt Điều Rang Muối Vỏ Lụa Đồng Nai',
      cooperative: 'HTX Nông Nghiệp Sinh Thái Long Khánh',
      area: 'Xuân Lộc & Long Khánh, TP Đồng Nai',
      peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestStatus: 'Sẵn hàng chế biến đóng hộp chân không',
      brixRating: 'Hạt Loại A tuyển chọn',
      tasteProfile: 'Bùi béo giòn rụm, mằn mặn dịu nhẹ của muối tinh',
      farmingNote: 'Rang củi gang truyền thống, đạt tiêu chuẩn an toàn thực phẩm HACCP.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format',
      productId: '5'
    },
    {
      id: 'ruoubuoi-tantrieu',
      cropName: 'Rượu Bưởi Tân Triều Truyền Thống',
      cooperative: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
      area: 'Làng bưởi cổ Tân Triều, Vĩnh Cửu',
      peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      harvestStatus: 'Hạ thổ 6 tháng vò sành sẵn sàng biếu tặng',
      brixRating: '15% Vol tự nhiên',
      tasteProfile: 'Êm dịu ngọt hậu, thơm tinh dầu vỏ bưởi thanh khiết, hỗ trợ tiêu hóa',
      farmingNote: 'Lên men tự nhiên từ nước cốt bưởi đường lá cam và nếp cái hoa vàng.',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format',
      productId: '6'
    }
  ];

  const activeCropsInMonth = seasons.filter(s => s.peakMonths.includes(selectedMonth));

  return (
    <Container className="py-10 max-w-6xl space-y-10">
      {/* Page Title */}
      <div className="space-y-3">
        <Badge className="bg-amber-100 text-amber-800 border-0 font-bold px-3 py-1 text-xs inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          Lịch Thu Hoạch Nông Sản Chính Vụ 2026
        </Badge>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Lịch Mùa Vụ Nông Sản Thành Phố Đồng Nai
        </h1>
        <p className="text-gray-600 text-sm max-w-3xl leading-relaxed">
          Tra cứu thời điểm thu hoạch rộ nhất để thưởng thức trái cây chín cây ngọt đậm đà, hoặc đặt lịch trước với hợp tác xã để giữ chỗ những lô bưởi Tết OCOP 4 sao và sầu riêng loại 1.
        </p>
      </div>

      {/* Month Selector Carousel / Tabs */}
      <Card className="p-4 rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 text-xs">
          <span className="font-bold text-gray-500">Chọn tháng để xem nông sản vào vụ:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Hiện tại: Tháng {currentMonth} (Đang cao điểm bưởi Tân Triều)
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`py-3 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                selectedMonth === m
                  ? 'bg-emerald-600 text-white shadow-md scale-105'
                  : m === currentMonth
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>T.{m}</span>
              {m === currentMonth && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Seasonal Crops Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900">
            Nông Sản Đang Thu Hoạch & Sẵn Hàng Trong Tháng {selectedMonth} ({activeCropsInMonth.length} loại)
          </h2>
          <Link
            href="/ai-tu-van"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Hỏi AI về lịch mùa vụ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCropsInMonth.map((crop) => (
            <Card
              key={crop.id}
              className="p-5 rounded-3xl border border-gray-150 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all bg-white flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 relative">
                  <img
                    src={crop.imageUrl}
                    alt={crop.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute top-2.5 right-2.5 bg-emerald-600/90 backdrop-blur-md text-white border-0 font-bold text-[10px]">
                    {crop.brixRating}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    {crop.cooperative}
                  </span>
                  <h3 className="font-black text-base text-gray-900 group-hover:text-emerald-700 transition-colors pt-1">
                    {crop.cropName}
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-slate-50 p-3 rounded-2xl">
                  <p className="flex items-start gap-1 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{crop.harvestStatus}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    <strong>Hương vị:</strong> {crop.tasteProfile}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    <strong>Kỹ thuật:</strong> {crop.farmingNote}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/products/${crop.productId}`}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Xem Chi Tiết & Đặt Hàng</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pre-order Callout */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <Badge className="bg-white/20 text-white border-0 font-bold px-3 py-1 text-xs">
            Chính Sách Đặt Trước Vụ Mùa
          </Badge>
          <h3 className="text-xl md:text-2xl font-black">
            Đặt Trước Bưởi Đường Lá Cam Tết 2026 Ngay Hôm Nay
          </h3>
          <p className="text-amber-100 text-xs md:text-sm leading-relaxed">
            Hợp Tác Xã Tân Triều mở cổng đặt trước lô bưởi cành lộc OCOP 4 sao tuyển chọn cho khách hàng cá nhân và doanh nghiệp. Đảm bảo giữ đúng giá tại vườn và giao hàng chuẩn ngày hẹn.
          </p>
        </div>

        <Link
          href="/ai-tu-van"
          className="bg-white hover:bg-amber-50 text-amber-900 font-black px-6 py-3 rounded-2xl text-xs md:text-sm transition-all shadow-lg flex-shrink-0"
        >
          Liên Hệ AI Đặt Trước
        </Link>
      </div>
    </Container>
  );
}
