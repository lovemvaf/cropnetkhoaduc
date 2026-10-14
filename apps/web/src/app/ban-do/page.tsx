'use client';

import React, { useState } from 'react';
import { Container } from '@cropnet/ui';
import { MapPin, ExternalLink, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';

interface FarmPin {
  id: string;
  name: string;
  shortName: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  established: string;
  hectares: number;
  soilType: string;
  specialties: string[];
  certifications: string[];
  phone: string;
  representative: string;
  imageUrl: string;
  description: string;
}

export default function CooperativeMapPage() {
  const [selectedFarmId, setSelectedFarmId] = useState<string>('tantrieu');

  const farms: FarmPin[] = [
    {
      id: 'tantrieu',
      name: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
      shortName: 'Cù Lao Tân Triều',
      area: 'Phường Tân Triều, Thành phố Đồng Nai',
      address: 'Phường Tân Triều, Thành phố Đồng Nai (vùng Cù lao Tân Triều lịch sử)',
      latitude: 11.0267,
      longitude: 106.8835,
      established: '2012',
      hectares: 350,
      soilType: 'Đất phù sa bồi đắp bởi dòng sông Đồng Nai',
      specialties: ['Bưởi Đường Lá Cam', 'Bưởi Da Xanh'],
      certifications: ['OCOP 4 Sao Tỉnh Đồng Nai', 'VietGAP Trồng Trọt'],
      phone: '0251.3852.xxx',
      representative: 'Ban Quản Trị HTX Tân Triều',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
      description: 'Cù lao Tân Triều được bao bọc bởi nhánh sông Đồng Nai, tích tụ lớp phù sa trù phú. Giống bưởi đường lá cam nức tiếng nhờ tép mọng nước vàng óng, vị ngọt thanh dịu mát không the đắng.'
    },
    {
      id: 'longkhanh',
      name: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
      shortName: 'Miệt Vườn Long Khánh',
      area: 'Phường Xuân Lập, Thành phố Đồng Nai',
      address: 'Phường Xuân Lập, Thành phố Đồng Nai',
      latitude: 10.9258,
      longitude: 107.2412,
      established: '2015',
      hectares: 480,
      soilType: 'Đất đỏ bazan màu mỡ tầng sâu đặc trưng Đông Nam Bộ',
      specialties: ['Sầu Riêng Ri6 Chín Cây', 'Chôm Chôm Nhãn', 'Hạt Điều Rang Củi'],
      certifications: ['Chuẩn Canh Tác Sinh Thái', 'VietGAP'],
      phone: '0251.3789.xxx',
      representative: 'Ban Giám Đốc HTX Long Khánh',
      imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&auto=format',
      description: 'Nằm trên dải đất đỏ bazan trứ danh của vùng cây ăn trái Long Khánh, các hộ xã viên cam kết chỉ thu hoạch sầu riêng già chín cây tự nhiên, không ngâm thuốc kích chín.'
    }
  ];

  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0];

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8 max-w-6xl">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E2E5DC] pb-6 space-y-2">
          <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
            Bản Đồ Nông Nghiệp Số
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight">
            Vùng Trồng Nông Sản & Hợp Tác Xã Thành Phố Đồng Nai
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] max-w-3xl leading-relaxed">
            Định vị địa lý vùng nguyên liệu bưởi cù lao Tân Triều và vựa trái cây đất đỏ bazan Long Khánh. 
            Kết nối trực tiếp từ cổng vườn tới khách hàng tiêu dùng và đối tác mua sỉ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Map Visualizer (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E5DC] overflow-hidden shadow-subtle">
              {/* Map Toolbar */}
              <div className="p-3.5 bg-[#F1EFE8] border-b border-[#E2E5DC] flex items-center justify-between text-xs text-[#253129]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2C4939]"></span>
                  <span className="font-medium">Tọa Độ GIS: VN-2000 (Thành phố Đồng Nai)</span>
                </div>
                <span className="text-[#647067] text-[11px]">Quy mô: 830 Hecta</span>
              </div>

              {/* Map Canvas */}
              <div className="relative aspect-[16/10] bg-[#EAECE6] overflow-hidden flex items-center justify-center">
                {/* Background Map Imagery */}
                <div 
                  className="absolute inset-0 opacity-50 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format')"
                  }}
                />

                {/* River Dong Nai stylized representation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0,35 Q 35,45 50,60 T 100,75" fill="none" stroke="#3A6B7E" strokeWidth="4" />
                  <text x="12" y="32" fill="#253129" fontSize="3" fontWeight="600">Sông Đồng Nai</text>
                </svg>

                {/* Pin 1: Tan Trieu */}
                <div 
                  onClick={() => setSelectedFarmId('tantrieu')}
                  className={`absolute cursor-pointer transition-transform transform -translate-x-1/2 -translate-y-1/2 ${
                    selectedFarmId === 'tantrieu' ? 'scale-110 z-30' : 'scale-100 z-20 hover:scale-105 opacity-90'
                  }`}
                  style={{ left: '30%', top: '44%' }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`px-2 py-0.5 rounded text-[11px] font-medium shadow-subtle mb-1 whitespace-nowrap border ${
                      selectedFarmId === 'tantrieu'
                        ? 'bg-[#2C4939] text-white border-[#2C4939]'
                        : 'bg-white text-[#253129] border-[#E2E5DC]'
                    }`}>
                      HTX Bưởi Tân Triều
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#2C4939] text-white flex items-center justify-center shadow-subtle border-2 border-white">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Pin 2: Long Khanh */}
                <div 
                  onClick={() => setSelectedFarmId('longkhanh')}
                  className={`absolute cursor-pointer transition-transform transform -translate-x-1/2 -translate-y-1/2 ${
                    selectedFarmId === 'longkhanh' ? 'scale-110 z-30' : 'scale-100 z-20 hover:scale-105 opacity-90'
                  }`}
                  style={{ left: '72%', top: '65%' }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`px-2 py-0.5 rounded text-[11px] font-medium shadow-subtle mb-1 whitespace-nowrap border ${
                      selectedFarmId === 'longkhanh'
                        ? 'bg-[#A46C49] text-white border-[#A46C49]'
                        : 'bg-white text-[#253129] border-[#E2E5DC]'
                    }`}>
                      HTX Long Khánh
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#A46C49] text-white flex items-center justify-center shadow-subtle border-2 border-white">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Coordinates metadata */}
                <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#253129] px-2.5 py-1 rounded text-[10px] font-mono border border-[#E2E5DC]">
                  {activeFarm.latitude.toFixed(4)}°N, {activeFarm.longitude.toFixed(4)}°E
                </div>

                {/* Map attribution */}
                <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#8C978F] px-2 py-0.5 rounded text-[9px] border border-[#E2E5DC]">
                  © OpenStreetMap (ODbL)
                </div>
              </div>

              {/* Quick Switcher Buttons */}
              <div className="p-3.5 bg-white border-t border-[#E2E5DC] flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  {farms.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFarmId(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        selectedFarmId === f.id
                          ? 'bg-[#2C4939] text-white border-[#2C4939]'
                          : 'bg-[#F1EFE8] text-[#253129] border-[#E2E5DC] hover:bg-[#E7E4DC]'
                      }`}
                    >
                      {f.shortName}
                    </button>
                  ))}
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeFarm.latitude},${activeFarm.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#2C4939] hover:underline inline-flex items-center gap-1"
                >
                  <span>Chỉ đường trên bản đồ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Selected Farm Profile (Right 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 shadow-subtle space-y-5">
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#F1EFE8] relative">
                  <img
                    src={activeFarm.imageUrl}
                    alt={activeFarm.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#2C4939] text-[11px] font-medium px-2 py-0.5 rounded border border-[#E2E5DC]">
                    Quy mô canh tác: {activeFarm.hectares} ha
                  </div>
                </div>

                <h2 className="text-lg font-bold text-[#253129] leading-snug">
                  {activeFarm.name}
                </h2>

                <p className="text-xs text-[#647067] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7B876C] flex-shrink-0 mt-0.5" />
                  <span>{activeFarm.address}</span>
                </p>
              </div>

              {/* Certifications */}
              <div className="space-y-1.5 border-t border-[#E2E5DC] pt-3">
                <span className="text-[11px] font-semibold text-[#8C978F] uppercase tracking-wider block">
                  Tiêu chuẩn sản xuất
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeFarm.certifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 bg-[#FAF5F1] text-[#A46C49] border border-[#F3E8DF] text-[11px] font-medium px-2.5 py-0.5 rounded"
                    >
                      <Award className="w-3 h-3 text-[#A46C49]" />
                      <span>{c}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Farm Key Attributes */}
              <div className="space-y-2 text-xs bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E2E5DC]">
                <div className="flex justify-between">
                  <span className="text-[#8C978F]">Đại diện HTX:</span>
                  <span className="font-medium text-[#253129]">{activeFarm.representative}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C978F]">Thổ nhưỡng:</span>
                  <span className="font-medium text-[#253129] text-right max-w-[65%]">{activeFarm.soilType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C978F]">Nông sản chủ lực:</span>
                  <span className="font-medium text-[#253129] text-right max-w-[65%]">{activeFarm.specialties.join(', ')}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#647067] leading-relaxed">
                {activeFarm.description}
              </p>

              {/* Link to Products */}
              <div className="pt-2 border-t border-[#E2E5DC]">
                <Link
                  href="/products"
                  className="w-full bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors block text-center"
                >
                  <span>Xem sản phẩm của HTX này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
