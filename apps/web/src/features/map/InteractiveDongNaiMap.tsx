'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, Layers, Search, ShieldCheck, CheckCircle2, Info, Compass } from 'lucide-react';
import Link from 'next/link';

export interface MapPoint {
  id: string;
  name: string;
  shortName: string;
  tier: 1 | 2 | 3; // 1: Vùng lãnh thổ truyền thống, 2: HTX/Nhà vườn xác minh, 3: Lô hàng QR
  tierLabel: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  established?: string;
  hectares?: number;
  soilType: string;
  specialties: string[];
  certifications: string[];
  verifiedStatus: 'VERIFIED' | 'MONITORED' | 'TRADITIONAL_REGION';
  representative?: string;
  imageUrl?: string;
  description: string;
  qrBatchCode?: string;
}

export const DONG_NAI_MAP_POINTS: MapPoint[] = [
  // TIER 2: HTX đã xác thực
  {
    id: 'htx-tantrieu',
    name: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
    shortName: 'HTX Cù Lao Tân Triều',
    tier: 2,
    tierLabel: 'Cấp 2: Hợp Tác Xã Xác Minh',
    area: 'Phường Tân Triều, Thành phố Đồng Nai',
    address: 'Phường Tân Triều, Thành phố Đồng Nai (vùng Cù lao Tân Triều lịch sử)',
    latitude: 11.0267,
    longitude: 106.8835,
    established: '2012',
    hectares: 350,
    soilType: 'Đất phù sa bồi đắp bởi dòng sông Đồng Nai',
    specialties: ['Bưởi Đường Lá Cam', 'Bưởi Da Xanh'],
    certifications: ['OCOP 4 Sao Tỉnh Đồng Nai', 'VietGAP Trồng Trọt'],
    verifiedStatus: 'VERIFIED',
    representative: 'Ban Quản Trị HTX Tân Triều',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
    description: 'Cù lao Tân Triều được bao bọc bởi các nhánh sông Đồng Nai, tích tụ lớp phù sa trù phú. Giống bưởi đường lá cam nức tiếng nhờ tép mọng nước vàng óng, vị ngọt thanh dịu mát không the đắng.',
    qrBatchCode: 'BATCH-BUOI-TANTRIEU-2026-01'
  },
  {
    id: 'htx-longkhanh',
    name: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
    shortName: 'HTX Miệt Vườn Long Khánh',
    tier: 2,
    tierLabel: 'Cấp 2: Hợp Tác Xã Xác Minh',
    area: 'Phường Xuân Lập, Thành phố Đồng Nai',
    address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
    latitude: 10.9258,
    longitude: 107.2412,
    established: '2015',
    hectares: 480,
    soilType: 'Đất đỏ bazan màu mỡ tầng sâu đặc trưng Đông Nam Bộ',
    specialties: ['Sầu Riêng Ri6 Chín Cây', 'Chôm Chôm Nhãn', 'Hạt Điều Rang Củi'],
    certifications: ['Chuẩn Canh Tác Sinh Thái', 'VietGAP'],
    verifiedStatus: 'VERIFIED',
    representative: 'Ban Giám Đốc HTX Long Khánh',
    imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&auto=format',
    description: 'Nằm trên dải đất đỏ bazan trứ danh của vùng cây ăn trái Long Khánh, các hộ xã viên cam kết chỉ thu hoạch sầu riêng già chín cây tự nhiên, không ngâm thuốc kích chín.',
    qrBatchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01'
  },

  // TIER 3: Lô hàng QR cụ thể
  {
    id: 'batch-hatdieu-dongnai',
    name: 'Vùng Thu Hoạch Hạt Điều Rang Muối Vỏ Lụa',
    shortName: 'Lô Điều Đồng Nai (HACCP)',
    tier: 3,
    tierLabel: 'Cấp 3: Lô Hàng QR Truy Xuất',
    area: 'Định Quán & Bù Đăng, Thành phố Đồng Nai',
    address: 'Khu quy hoạch chế biến nông sản sạch Thành phố Đồng Nai',
    latitude: 11.2350,
    longitude: 107.1680,
    established: '2020',
    hectares: 120,
    soilType: 'Đất đồi dốc thoát nước bazan phong hóa',
    specialties: ['Hạt Điều Rang Củi', 'Hạt Điều Vỏ Lụa'],
    certifications: ['HACCP Tiêu Chuẩn Quốc Tế', 'ISO 22000'],
    verifiedStatus: 'VERIFIED',
    representative: 'Tổ Hợp Tác Chế Biến Điều Sạch',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format',
    description: 'Lô hàng được chế biến từ hạt điều thu hoạch vụ mới, rang củi thủ công giữ nguyên vị béo bùi tự nhiên, có tem QR số hóa từng bao bì đóng gói.',
    qrBatchCode: 'BATCH-HATDIEU-DONGNAI-2026-01'
  },

  // TIER 1: Vùng nông nghiệp truyền thống toàn địa bàn Đồng Nai (gồm các vùng sáp nhập 2025)
  {
    id: 'region-xuanloc',
    name: 'Vùng Nông Nghiệp Cây Ăn Trái Núi Chứa Chan (Xuân Lộc)',
    shortName: 'Vùng Trồng Xuân Lộc',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Huyện Xuân Lộc, Thành phố Đồng Nai',
    address: 'Khu vực chân núi Chứa Chan, Xuân Lộc, Thành phố Đồng Nai',
    latitude: 10.9325,
    longitude: 107.3820,
    hectares: 1200,
    soilType: 'Đất đá phong hóa chân núi màu mỡ',
    specialties: ['Sầu Riêng', 'Bơ Sáp', 'Hồ Tiêu'],
    certifications: ['Vùng Chỉ Dẫn Địa Lý'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Vùng canh tác cây ăn trái lâu năm dưới chân núi Chứa Chan, khí hậu tiểu vùng mát mẻ, cho chất lượng trái cây ngọt đậm đà.'
  },
  {
    id: 'region-cammy',
    name: 'Vùng Hồ Tiêu & Nông Sản Sinh Thái Cẩm Mỹ',
    shortName: 'Vùng Hồ Tiêu Cẩm Mỹ',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Huyện Cẩm Mỹ, Thành phố Đồng Nai',
    address: 'Khu vực hồ tiêu sinh thái Cẩm Mỹ, Thành phố Đồng Nai',
    latitude: 10.7932,
    longitude: 107.2185,
    hectares: 850,
    soilType: 'Đất bazan đỏ tầng sâu',
    specialties: ['Hồ Tiêu Đen', 'Hồ Tiêu Sọ', 'Sầu Riêng'],
    certifications: ['Chứng Nhận Nhãn Hiệu Tập Thể'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Thương hiệu tiêu Cẩm Mỹ nức tiếng với hạt chắc mẩy, vị cay nồng đặc trưng, đang được định hướng mở rộng canh tác hữu cơ.'
  },
  {
    id: 'region-cattien',
    name: 'Vùng Vành Đai Rừng Sinh Thái Vườn Quốc Gia Cát Tiên',
    shortName: 'Vùng Đệm Nam Cát Tiên',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Tân Phú & Cát Tiên, Thành phố Đồng Nai',
    address: 'Vùng đệm Vườn Quốc Gia Cát Tiên, Thành phố Đồng Nai',
    latitude: 11.4285,
    longitude: 107.4268,
    hectares: 2100,
    soilType: 'Đất rừng tự nhiên và phù sa thượng nguồn sông Đồng Nai',
    specialties: ['Lúa Sinh Thái', 'Nấm Dược Liệu', 'Mật Ong Rừng'],
    certifications: ['Khu Dự Trữ Sinh Quyển Thế Giới'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Khu vực sản xuất nông nghiệp thuận tự nhiên, bảo vệ hành lang sinh học của Vườn Quốc Gia Cát Tiên, không sử dụng hóa chất độc hại.'
  },
  {
    id: 'region-trian',
    name: 'Vùng Nông Thủy Sản Lòng Hồ Thủy Điện Trị An',
    shortName: 'Vùng Sinh Thái Hồ Trị An',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Huyện Vĩnh Cửu, Thành phố Đồng Nai',
    address: 'Ven hồ Trị An, Vĩnh Cửu, Thành phố Đồng Nai',
    latitude: 11.1215,
    longitude: 107.0189,
    hectares: 900,
    soilType: 'Đất bán ngập ven hồ trù phú',
    specialties: ['Thủy Sản Nước Ngọt', 'Xoài Ba Mùa', 'Cây Có Múi'],
    certifications: ['Vùng Khai Thác Bền Vững'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Khu vực quanh hồ chứa nước ngọt Trị An với hệ sinh thái phong phú, kết hợp mô hình nông nghiệp sinh thái kết hợp du lịch trải nghiệm.'
  },
  {
    id: 'region-dongxoai',
    name: 'Thủ Phủ Hạt Điều Đất Đỏ Phía Bắc (Đồng Xoài)',
    shortName: 'Vùng Điều Đồng Xoài',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Khu vực phía Bắc, Thành phố Đồng Nai (vùng Bình Phước trước đây)',
    address: 'Đồng Xoài, Thành phố Đồng Nai',
    latitude: 11.5333,
    longitude: 106.8833,
    hectares: 3500,
    soilType: 'Đất đỏ bazan đồi lượn sóng',
    specialties: ['Hạt Điều Thô', 'Hạt Điều Chế Biến Sâu', 'Cao Su'],
    certifications: ['Chỉ Dẫn Địa Lý Hạt Điều'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Vùng chuyên canh hạt điều lớn nhất khu vực với chất lượng hạt béo giòn đạt tiêu chuẩn xuất khẩu quốc tế.'
  },
  {
    id: 'region-phurieng',
    name: 'Vùng Nông Lâm Nghiệp & Điều Sinh Thái Phú Riềng',
    shortName: 'Vùng Phú Riềng',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Khu vực Phú Riềng, Thành phố Đồng Nai',
    address: 'Phú Riềng, Thành phố Đồng Nai',
    latitude: 11.7580,
    longitude: 106.9850,
    hectares: 2800,
    soilType: 'Đất đỏ bazan màu mỡ tầng sâu',
    specialties: ['Hạt Điều Ghép Vụ Mới', 'Cao Su', 'Sầu Riêng'],
    certifications: ['Vùng Sản Xuất Nông Lâm'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Địa bàn có truyền thống canh tác nông lâm kết hợp, năng suất hạt điều và sầu riêng phát triển mạnh.'
  },
  {
    id: 'region-chonthanh',
    name: 'Khu Nông Nghiệp Ứng Dụng Công Nghệ Cao Chơn Thành',
    shortName: 'Vùng CNC Chơn Thành',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Khu vực Chơn Thành, Thành phố Đồng Nai',
    address: 'Chơn Thành, Thành phố Đồng Nai',
    latitude: 11.4720,
    longitude: 106.6680,
    hectares: 650,
    soilType: 'Đất xám bạc màu chuyển tiếp bazan',
    specialties: ['Dưa Lưới Nhà Màng', 'Rau Thủy Canh', 'Cây Ăn Trái'],
    certifications: ['Nông Nghiệp Công Nghệ Cao'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Khu vực cửa ngõ tập trung nhiều dự án nông nghiệp công nghệ cao trong nhà màng, tự động hóa tưới tiêu.'
  },
  {
    id: 'region-budang',
    name: 'Vùng Sầu Riêng & Cây Công Nghiệp Bù Đăng',
    shortName: 'Vùng Bazan Bù Đăng',
    tier: 1,
    tierLabel: 'Cấp 1: Vùng Lãnh Thổ Truyền Thống',
    area: 'Khu vực Bù Đăng, Thành phố Đồng Nai',
    address: 'Bù Đăng, Thành phố Đồng Nai',
    latitude: 11.7650,
    longitude: 107.2420,
    hectares: 1900,
    soilType: 'Đất đỏ bazan đồi cao',
    specialties: ['Sầu Riêng Monthong / Ri6', 'Hạt Điều Cổ Thụ', 'Cà Phê'],
    certifications: ['Vùng Trồng Đạt Chuẩn Xuất Khẩu'],
    verifiedStatus: 'TRADITIONAL_REGION',
    description: 'Địa hình đồi cao khí hậu mát mẻ, sầu riêng Bù Đăng có cơm vàng hạt lép, thơm béo đặc trưng thu hoạch rộ vào tháng 6 - 8.'
  }
];

export default function InteractiveDongNaiMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});

  const [selectedPointId, setSelectedPointId] = useState<string>('htx-tantrieu');
  const [activeTier, setActiveTier] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPoints = DONG_NAI_MAP_POINTS.filter(p => {
    if (activeTier !== 'ALL' && p.tier !== activeTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.specialties.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activePoint = DONG_NAI_MAP_POINTS.find(p => p.id === selectedPointId) || DONG_NAI_MAP_POINTS[0];

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      // Center around Dong Nai province (including former Binh Phuoc territory)
      const map = L.map(mapContainerRef.current, {
        center: [11.25, 107.05],
        zoom: 9,
        minZoom: 8,
        maxZoom: 16,
        scrollWheelZoom: true
      });

      mapInstanceRef.current = map;

      // Authentic CartoDB Voyager tiles (neutral editorial aesthetic, generous open usage)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Create custom SVG markers
      DONG_NAI_MAP_POINTS.forEach(point => {
        const isTier2 = point.tier === 2;
        const isTier3 = point.tier === 3;
        const color = isTier2 ? '#2C4939' : (isTier3 ? '#A46C49' : '#7B876C');
        const strokeColor = '#FFFFFF';

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${color};
              border: 2px solid ${strokeColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
              transform: translate(-50%, -50%);
              transition: transform 0.2s ease;
            ">
              <span style="color: white; font-size: 11px; font-weight: bold;">
                ${isTier2 ? 'HTX' : (isTier3 ? 'QR' : 'V')}
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([point.latitude, point.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 180px;">
              <strong style="color: #253129; font-size: 14px; display: block; margin-bottom: 4px;">${point.shortName}</strong>
              <span style="color: ${color}; font-weight: 600; font-size: 11px; display: block; margin-bottom: 4px;">${point.tierLabel}</span>
              <p style="color: #647067; margin: 0 0 6px 0; font-size: 12px;">${point.area}</p>
              <div style="font-size: 11px; color: #2C4939; font-weight: 500;">
                Đặc sản: ${point.specialties.join(', ')}
              </div>
            </div>
          `);

        marker.on('click', () => {
          setSelectedPointId(point.id);
        });

        markersRef.current[point.id] = marker;
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // When selectedPoint changes, pan to it and open popup
  const handleSelectPoint = (point: MapPoint) => {
    setSelectedPointId(point.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([point.latitude, point.longitude], 12, { duration: 1.2 });
      const marker = markersRef.current[point.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E2E5DC] p-4 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* 3-Tier Layer Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#647067] flex items-center gap-1.5 mr-1">
              <Layers className="w-3.5 h-3.5" />
              Lớp dữ liệu:
            </span>
            {[
              { id: 'ALL', label: 'Tất cả (11 vùng)' },
              { id: 2, label: 'Cấp 2: HTX Xác Minh (2)' },
              { id: 3, label: 'Cấp 3: Lô Hàng QR (1)' },
              { id: 1, label: 'Cấp 1: Vùng Lãnh Thổ (8)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTier(tab.id as any)}
                className={`text-xs font-medium px-3 py-1.5 rounded-control transition-colors ${
                  activeTier === tab.id
                    ? 'bg-[#2C4939] text-white shadow-subtle'
                    : 'bg-[#FAF9F5] text-[#253129] border border-[#E2E5DC] hover:bg-[#F1EFE8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8C978F] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm vùng trồng, HTX..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] rounded-control pl-9 pr-3 py-1.5 text-xs text-[#253129] placeholder-[#8C978F] focus:outline-none focus:border-[#2C4939]"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#E2E5DC] text-[11px] text-[#647067]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2C4939]"></span>
            <span>HTX & Nhà vườn đối tác xác minh (Cấp 2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A46C49]"></span>
            <span>Lô hàng truy xuất tem QR (Cấp 3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7B876C]"></span>
            <span>Vùng lãnh thổ nông nghiệp truyền thống (Cấp 1)</span>
          </div>
          <div className="ml-auto text-[10px] text-[#8C978F]">
            Hệ quy chiếu: WGS84 (EPSG:4326) • Dữ liệu cập nhật: 10/2026
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leaflet Map Canvas (Left 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E5DC] overflow-hidden shadow-subtle">
          <div className="p-3 bg-[#F1EFE8] border-b border-[#E2E5DC] flex items-center justify-between text-xs text-[#253129]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2C4939] animate-pulse"></span>
              <span className="font-semibold">Bản Đồ Số Nông Nghiệp Thành Phố Đồng Nai (Bao gồm vùng Bình Phước sáp nhập)</span>
            </div>
            <span className="text-[#647067] text-[11px]">Hiển thị: {filteredPoints.length} điểm</span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[480px] sm:h-[560px] bg-[#EAECE6] z-10"
          />
        </div>

        {/* Selected Point Inspector (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E5DC] p-5 shadow-subtle space-y-4">
            {/* Header info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                  activePoint.tier === 2 ? 'bg-[#E6EAE4] text-[#2C4939]' :
                  activePoint.tier === 3 ? 'bg-[#F3E8DF] text-[#A46C49]' : 'bg-[#ECEEE7] text-[#7B876C]'
                }`}>
                  {activePoint.tierLabel}
                </span>

                <span className="text-[11px] text-[#8C978F] font-mono">
                  {activePoint.latitude.toFixed(4)}°N, {activePoint.longitude.toFixed(4)}°E
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#253129] leading-snug">
                {activePoint.name}
              </h2>
              <p className="text-xs text-[#647067] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7B876C] shrink-0" />
                <span>{activePoint.address}</span>
              </p>
            </div>

            {/* Image if available */}
            {activePoint.imageUrl && (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#E2E5DC] bg-[#FAF9F5]">
                <img
                  src={activePoint.imageUrl}
                  alt={activePoint.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-[#647067] leading-relaxed border-t border-[#E2E5DC] pt-3">
              {activePoint.description}
            </p>

            {/* Stats metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="p-2.5 rounded-control bg-[#FAF9F5] border border-[#E2E5DC]">
                <span className="text-[10px] text-[#8C978F] block">Thổ nhưỡng</span>
                <span className="font-medium text-[#253129] text-[11px] line-clamp-1">{activePoint.soilType}</span>
              </div>
              <div className="p-2.5 rounded-control bg-[#FAF9F5] border border-[#E2E5DC]">
                <span className="text-[10px] text-[#8C978F] block">Quy mô</span>
                <span className="font-medium text-[#253129] text-[11px]">{activePoint.hectares ? `${activePoint.hectares} Hecta` : 'Toàn tiểu vùng'}</span>
              </div>
            </div>

            {/* Specialties & Certifications */}
            <div className="space-y-2 pt-2">
              <div>
                <span className="text-[11px] font-semibold text-[#253129] block mb-1">Đặc sản chính:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activePoint.specialties.map(spec => (
                    <span key={spec} className="px-2 py-0.5 bg-[#FAF9F5] border border-[#E2E5DC] text-[#253129] rounded text-[11px]">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#253129] block mb-1">Tiêu chuẩn & Chứng nhận:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activePoint.certifications.map(cert => (
                    <span key={cert} className="px-2 py-0.5 bg-[#E6EAE4] text-[#2C4939] rounded text-[11px] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#2C4939]" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* External Map Directions Link */}
            <div className="pt-3 border-t border-[#E2E5DC] flex items-center justify-between gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activePoint.latitude},${activePoint.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#2C4939] hover:underline font-semibold"
              >
                <span>Chỉ đường trên Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {activePoint.qrBatchCode && (
                <Link
                  href={`/traceability/${activePoint.qrBatchCode}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2C4939] hover:bg-[#233C2F] text-white text-[11px] font-medium rounded-control transition-colors"
                >
                  <span>Xem tem QR</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick list of other regions */}
          <div className="bg-white rounded-xl border border-[#E2E5DC] p-4 shadow-subtle space-y-2 max-h-60 overflow-y-auto">
            <span className="text-xs font-semibold text-[#647067] block uppercase tracking-wider">
              Danh sách địa bàn ({filteredPoints.length})
            </span>
            <div className="space-y-1">
              {filteredPoints.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPoint(p)}
                  className={`w-full text-left p-2 rounded-control text-xs transition-colors flex items-center justify-between ${
                    p.id === selectedPointId
                      ? 'bg-[#E6EAE4] text-[#2C4939] font-semibold'
                      : 'hover:bg-[#FAF9F5] text-[#253129]'
                  }`}
                >
                  <span className="truncate">{p.shortName}</span>
                  <span className="text-[10px] text-[#8C978F] shrink-0 ml-2">
                    {p.tier === 2 ? 'HTX' : (p.tier === 3 ? 'QR' : 'Vùng')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
