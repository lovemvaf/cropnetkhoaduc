'use client';

import React, { useState } from 'react';
import { Container, Card, Badge, Button } from '@cropnet/ui';
import { 
  MapPin, Navigation, Phone, Award, ShieldCheck, ExternalLink, 
  Leaf, Info, Compass, Sparkles, ArrowRight, Layers 
} from 'lucide-react';
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
  productIds: string[];
}

export default function CooperativeMapPage() {
  const [selectedFarmId, setSelectedFarmId] = useState<string>('tantrieu');
  const [filterType, setFilterType] = useState<string>('ALL');

  const farms: FarmPin[] = [
    {
      id: 'tantrieu',
      name: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
      shortName: 'Làng Bưởi Cù Lao Tân Triều',
      area: 'Huyện Vĩnh Cửu, Thành phố Đồng Nai',
      address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
      latitude: 11.0267,
      longitude: 106.8835,
      established: '2012',
      hectares: 350,
      soilType: 'Đất phù sa ngọt bồi đắp bởi hệ thống sông Đồng Nai',
      specialties: ['Bưởi Đường Lá Cam', 'Bưởi Da Xanh', 'Rượu Bưởi Truyền Thống'],
      certifications: ['OCOP 4 Sao Tỉnh Đồng Nai', 'VietGAP Trồng Trọt'],
      phone: '0251.3852.xxx',
      representative: 'Ông Huỳnh Đức Ý (Ban Giám Đốc HTX)',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
      description: 'Cù lao Tân Triều được bao bọc bốn bề bởi dòng sông Đồng Nai hiền hòa, tích tụ lớp phù sa trù phú hàng trăm năm. Bưởi đường lá cam ở đây nức tiếng cả nước nhờ tép mọng nước vàng óng, ngọt thanh đậm đà không the đắng.',
      productIds: ['1', '2', '6']
    },
    {
      id: 'longkhanh',
      name: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
      shortName: 'Vùng Trái Cây Đất Đỏ Long Khánh',
      area: 'Thành phố Long Khánh, Thành phố Đồng Nai',
      address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
      latitude: 10.9258,
      longitude: 107.2412,
      established: '2015',
      hectares: 480,
      soilType: 'Đất đỏ Bazan màu mỡ tầng dày đặc trưng miền Đông',
      specialties: ['Sầu Riêng Ri6 Chín Cây', 'Chôm Chôm Nhãn Cơm Dày', 'Hạt Điều Rang Củi Muối Tinh'],
      certifications: ['VietGAP Chuỗi Cung Ứng', 'HACCP Chế Biến Hạt Điều'],
      phone: '0251.3789.xxx',
      representative: 'Bà Nguyễn Thị Lan (Tổ Trưởng Kỹ Thuật)',
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format',
      description: 'Nằm trên dải đất đỏ bazan trứ danh của thủ phủ trái cây Đông Nam Bộ, nông dân HTX Long Khánh cam kết chỉ thu hoạch sầu riêng già chín cây tự nhiên, không ngâm nhúng hóa chất kích chín, giữ trọn vị béo ngậy nguyên bản.',
      productIds: ['3', '4', '5']
    }
  ];

  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0];

  return (
    <Container className="py-10 max-w-6xl space-y-10">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-3">
        <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold px-3 py-1 text-xs inline-flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          Bản Đồ Nông Nghiệp Số Thành Phố Đồng Nai 2026
        </Badge>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Hệ Thống Bản Đồ Vùng Trồng & Hợp Tác Xã Sinh Thái
        </h1>
        <p className="text-gray-600 text-sm max-w-3xl leading-relaxed">
          Định vị vệ tinh chính xác vùng nguyên liệu bưởi cù lao Tân Triều và thủ phủ cây ăn trái đất đỏ Long Khánh. Kết nối chuỗi cung ứng minh bạch D2C trực tiếp từ cổng vườn tới tay người tiêu dùng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Interactive Map Visualizer (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden rounded-3xl border border-emerald-100 shadow-xl bg-white p-0 relative">
            {/* Map Header Toolbar */}
            <div className="p-4 bg-emerald-950 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold">GIS Live: Hệ Tọa Độ Nông Nghiệp VN-2000 (Đồng Nai)</span>
              </div>
              <span className="text-emerald-300 font-mono text-[11px]">Độ phủ: 830 Hecta</span>
            </div>

            {/* Interactive SVG / Map Canvas Representation */}
            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center">
              {/* Satellite Tile Background Pattern */}
              <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

              {/* River Dong Nai stylized representation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 0,30 Q 35,45 50,60 T 100,75" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="3,2" />
                <text x="15" y="38" fill="#38bdf8" fontSize="3" fontWeight="bold">Sông Đồng Nai</text>
              </svg>

              {/* Pin 1: Tan Trieu */}
              <div 
                onClick={() => setSelectedFarmId('tantrieu')}
                className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedFarmId === 'tantrieu' ? 'scale-125 z-30' : 'scale-100 z-20 hover:scale-110 opacity-90'
                }`}
                style={{ left: '28%', top: '42%' }}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg mb-1 whitespace-nowrap ${
                    selectedFarmId === 'tantrieu' ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30' : 'bg-white text-gray-800'
                  }`}>
                    HTX Bưởi Tân Triều
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-2 border-white animate-bounce">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Pin 2: Long Khanh */}
              <div 
                onClick={() => setSelectedFarmId('longkhanh')}
                className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedFarmId === 'longkhanh' ? 'scale-125 z-30' : 'scale-100 z-20 hover:scale-110 opacity-90'
                }`}
                style={{ left: '72%', top: '65%' }}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg mb-1 whitespace-nowrap ${
                    selectedFarmId === 'longkhanh' ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30' : 'bg-white text-gray-800'
                  }`}>
                    HTX Long Khánh
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xl border-2 border-white animate-bounce [animation-delay:0.3s]">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Coordinates display at bottom right */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-mono text-[10px] border border-white/10">
                Lat: {activeFarm.latitude.toFixed(4)}°N | Long: {activeFarm.longitude.toFixed(4)}°E
              </div>

              {/* Attribution */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-gray-300 px-2.5 py-1 rounded-lg text-[9px] border border-white/10">
                Bản đồ GIS © OpenStreetMap contributors (ODbL)
              </div>
            </div>

            {/* Quick Farm Switcher Chips */}
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                {farms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFarmId(f.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedFarmId === f.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-150 border border-gray-200'
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
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Chỉ đường Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        </div>

        {/* Selected Farm Detailed Profile (Right col) */}
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border border-emerald-100 shadow-lg bg-white space-y-6">
            <div className="space-y-3">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 relative">
                <img
                  src={activeFarm.imageUrl}
                  alt={activeFarm.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-emerald-600 text-white border-0 font-bold text-[10px]">
                  Diện tích {activeFarm.hectares} ha
                </Badge>
              </div>

              <h2 className="text-xl font-black text-gray-900 leading-snug">
                {activeFarm.name}
              </h2>

              <p className="text-xs text-gray-500 leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{activeFarm.address}</span>
              </p>
            </div>

            {/* Certifications badges */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Chứng nhận chất lượng</span>
              <div className="flex flex-wrap gap-1.5">
                {activeFarm.certifications.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Farm attributes */}
            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-gray-150">
              <div className="flex justify-between">
                <span className="text-gray-400">Đại diện HTX:</span>
                <span className="font-bold text-gray-800">{activeFarm.representative}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hotline:</span>
                <span className="font-mono font-bold text-emerald-700">{activeFarm.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Thổ nhưỡng:</span>
                <span className="font-bold text-gray-700 text-right max-w-[60%]">{activeFarm.soilType}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed">
              {activeFarm.description}
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link
                href="/products"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition-all block text-center"
              >
                <span>Xem Sản Phẩm Của HTX Này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
