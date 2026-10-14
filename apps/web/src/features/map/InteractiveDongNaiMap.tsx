'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  ExternalLink,
  Layers,
  Search,
  ShieldCheck,
  CheckCircle2,
  Info,
  Compass,
  Navigation,
  ZoomIn,
  ZoomOut,
  X,
  AlertCircle,
  RotateCcw,
  ShoppingBag,
  QrCode,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { MapPoint, MapTier, BasemapMode, SubRegion } from './types';
import { DONG_NAI_MAP_POINTS, removeVietnameseTones } from './mapData';
import {
  DONG_NAI_METROPOLITAN_BOUNDS,
  DONG_NAI_REGION_POLYGONS,
  getRegionsGeoJson
} from './dongNaiGeoJson';

// OpenFreeMap 100% Free, Keyless, Open-Source Vector Map Styles
const OPEN_FREE_MAP_STYLES: Record<BasemapMode, { name: string; url: string; description: string }> = {
  liberty: {
    name: 'Tiêu chuẩn (Liberty)',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    description: 'Bản đồ vector địa hình và hành chính tự nhiên, hiển thị rõ sông hồ và rừng cây.'
  },
  bright: {
    name: 'Sắc nét (Bright)',
    url: 'https://tiles.openfreemap.org/styles/bright',
    description: 'Bản đồ vector tương phản cao, tối ưu đọc tên đường và địa danh.'
  },
  positron: {
    name: 'Thanh lịch (Positron)',
    url: 'https://tiles.openfreemap.org/styles/positron',
    description: 'Bản đồ vector tông xám tối giản, tôn vinh các ghim và vùng nông sản.'
  }
};

function checkWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function InteractiveDongNaiMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const currentBasemapRef = useRef<BasemapMode>('liberty');

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  const [basemap, setBasemap] = useState<BasemapMode>('liberty');
  const [selectedPointId, setSelectedPointId] = useState<string>('htx-tantrieu');
  const [activeTier, setActiveTier] = useState<MapTier | 'ALL'>('ALL');
  const [activeSubRegion, setActiveSubRegion] = useState<SubRegion | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPolygons, setShowPolygons] = useState(true);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Lọc danh sách điểm theo tier, subRegion và tìm kiếm tiếng Việt không dấu
  const filteredPoints = useMemo(() => {
    return DONG_NAI_MAP_POINTS.filter(point => {
      if (activeTier !== 'ALL' && point.tier !== activeTier) return false;
      if (activeSubRegion !== 'ALL' && point.subRegion !== activeSubRegion) return false;
      if (searchQuery.trim()) {
        const queryNorm = removeVietnameseTones(searchQuery);
        const nameNorm = removeVietnameseTones(point.name);
        const shortNameNorm = removeVietnameseTones(point.shortName);
        const areaNorm = removeVietnameseTones(point.area);
        const specNorm = point.specialties.map(removeVietnameseTones).join(' ');
        const kwNorm = point.searchKeywords ? removeVietnameseTones(point.searchKeywords) : '';

        return (
          nameNorm.includes(queryNorm) ||
          shortNameNorm.includes(queryNorm) ||
          areaNorm.includes(queryNorm) ||
          specNorm.includes(queryNorm) ||
          kwNorm.includes(queryNorm)
        );
      }
      return true;
    });
  }, [activeTier, activeSubRegion, searchQuery]);

  // Điểm đang được chọn
  const activePoint = useMemo(() => {
    const found = DONG_NAI_MAP_POINTS.find(p => p.id === selectedPointId);
    if (found) return found;
    return filteredPoints[0] || DONG_NAI_MAP_POINTS[0];
  }, [selectedPointId, filteredPoints]);

  // Cập nhật selectedPointId nếu điểm hiện tại bị lọc ra khỏi kết quả
  useEffect(() => {
    if (filteredPoints.length > 0 && !filteredPoints.some(p => p.id === selectedPointId)) {
      setSelectedPointId(filteredPoints[0].id);
    }
  }, [filteredPoints, selectedPointId]);

  // Thêm layer đa giác tiểu vùng nông nghiệp
  const addPolygonLayers = useCallback((map: any) => {
    if (!map) return;
    try {
      if (map.getSource('dongnai-regions')) {
        map.removeLayer('regions-fill');
        map.removeLayer('regions-outline');
        map.removeSource('dongnai-regions');
      }

      map.addSource('dongnai-regions', {
        type: 'geojson',
        data: getRegionsGeoJson()
      });

      // Lớp tô màu trong suốt
      map.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'dongnai-regions',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.14
        }
      });

      // Lớp viền nét đứt
      map.addLayer({
        id: 'regions-outline',
        type: 'line',
        source: 'dongnai-regions',
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': 1.5,
          'line-dasharray': [3, 2]
        }
      });

      // Tương tác hover và click trên đa giác
      map.on('click', 'regions-fill', (e: any) => {
        if (!e.features || !e.features[0]) return;
        const regionId = e.features[0].properties.id;
        const matchPoint = DONG_NAI_MAP_POINTS.find(
          p => p.id === regionId.replace('poly-', 'region-') || p.id === regionId.replace('poly-', 'htx-')
        );
        if (matchPoint) {
          setSelectedPointId(matchPoint.id);
        }
      });

      map.on('mouseenter', 'regions-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'regions-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    } catch (err) {
      console.warn('Lỗi khi vẽ đa giác vùng:', err);
    }
  }, []);

  // Khởi tạo bản đồ MapLibre GL JS với OpenFreeMap Vector Tiles
  useEffect(() => {
    let isMounted = true;

    async function initMapLibre() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      // Kiểm tra hỗ trợ WebGL bản địa (không gọi hàm không tồn tại của thư viện)
      if (!checkWebGL()) {
        setWebglSupported(false);
        setMapError('Thiết bị hoặc trình duyệt của bạn không hỗ trợ WebGL.');
        return;
      }

      try {
        const mod: any = await import('maplibre-gl');
        if (!isMounted || !mapContainerRef.current) return;
        const Map = mod.Map || mod.default?.Map || mod.default;

        if (!Map) {
          throw new Error('Không tìm thấy Map class trong MapLibre GL JS');
        }

        const map = new Map({
          container: mapContainerRef.current,
          style: OPEN_FREE_MAP_STYLES.liberty.url,
          center: DONG_NAI_METROPOLITAN_BOUNDS.center, // [lng, lat]
          zoom: DONG_NAI_METROPOLITAN_BOUNDS.defaultZoom,
          minZoom: 7.5,
          maxZoom: 18,
          attributionControl: false // Sẽ thêm attribution tùy chỉnh đẹp bên dưới
        });

        mapInstanceRef.current = map;

        map.on('load', () => {
          if (!isMounted) return;
          setMapLoaded(true);
          setMapError(null);
          addPolygonLayers(map);
        });

        map.on('error', (e: any) => {
          console.warn('MapLibre notice:', e?.error?.message || e);
        });
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Lỗi khởi tạo MapLibre:', err);
        setMapError('Không thể khởi tạo engine bản đồ: ' + (err?.message || 'Lỗi không xác định'));
      }
    }

    initMapLibre();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [addPolygonLayers]);

  // Cập nhật lớp nền (OpenFreeMap Vector Style Switcher)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    if (currentBasemapRef.current === basemap) return; // Tránh set lại cùng style vô ích
    currentBasemapRef.current = basemap;

    const map = mapInstanceRef.current;
    const styleUrl = OPEN_FREE_MAP_STYLES[basemap].url;

    map.setStyle(styleUrl);

    map.once('style.load', () => {
      if (showPolygons) {
        addPolygonLayers(map);
      }
    });
  }, [basemap, mapLoaded, showPolygons, addPolygonLayers]);

  // Bật/tắt đa giác tiểu vùng
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    const map = mapInstanceRef.current;

    try {
      if (map.getLayer('regions-fill')) {
        map.setLayoutProperty('regions-fill', 'visibility', showPolygons ? 'visible' : 'none');
      }
      if (map.getLayer('regions-outline')) {
        map.setLayoutProperty('regions-outline', 'visibility', showPolygons ? 'visible' : 'none');
      }
    } catch (e) {
      // Ignore if layers not yet added
    }
  }, [showPolygons, mapLoaded]);

  // Tạo Popup DOM an toàn chống XSS
  const createSafePopupNode = useCallback((point: MapPoint, onSelect: () => void) => {
    const container = document.createElement('div');
    container.style.fontFamily = 'inherit';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    container.style.color = '#253129';
    container.style.padding = '4px 2px';
    container.style.minWidth = '220px';
    container.style.maxWidth = '260px';

    const header = document.createElement('div');
    header.style.marginBottom = '6px';

    const title = document.createElement('strong');
    title.textContent = point.name;
    title.style.fontSize = '13px';
    title.style.display = 'block';
    title.style.color = '#253129';
    title.style.lineHeight = '1.3';
    header.appendChild(title);

    const tierBadge = document.createElement('span');
    tierBadge.textContent = point.tierLabel;
    tierBadge.style.fontSize = '10px';
    tierBadge.style.fontWeight = '600';
    tierBadge.style.display = 'inline-block';
    tierBadge.style.marginTop = '2px';
    tierBadge.style.color = point.tier === 2 ? '#2C4939' : (point.tier === 3 ? '#A46C49' : '#5E6B56');
    header.appendChild(tierBadge);
    container.appendChild(header);

    const address = document.createElement('p');
    address.textContent = point.address;
    address.style.color = '#647067';
    address.style.fontSize = '11px';
    address.style.margin = '0 0 6px 0';
    container.appendChild(address);

    const specs = document.createElement('div');
    specs.textContent = `Đặc sản: ${point.specialties.join(', ')}`;
    specs.style.fontSize = '11px';
    specs.style.fontWeight = '500';
    specs.style.color = '#2C4939';
    specs.style.marginBottom = '8px';
    container.appendChild(specs);

    const btn = document.createElement('button');
    btn.textContent = 'Xem chi tiết & Dẫn đường';
    btn.style.width = '100%';
    btn.style.backgroundColor = '#2C4939';
    btn.style.color = '#FFFFFF';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.padding = '6px 8px';
    btn.style.fontSize = '11px';
    btn.style.fontWeight = '500';
    btn.style.cursor = 'pointer';
    btn.onclick = (e) => {
      e.stopPropagation();
      onSelect();
    };
    container.appendChild(btn);

    return container;
  }, []);

  // ĐỒNG BỘ MARKERS HOÀN TOÀN THEO BỘ LỌC (LOẠI BỎ TRIỆT ĐỂ GHIM MA)
  useEffect(() => {
    let isCancelled = false;

    async function updateMarkers() {
      if (!mapInstanceRef.current || !mapLoaded) return;
      const mod: any = await import('maplibre-gl');
      if (isCancelled || !mapInstanceRef.current) return;

      const Marker = mod.Marker || mod.default?.Marker;
      const Popup = mod.Popup || mod.default?.Popup;
      if (!Marker || !Popup) return;

      const map = mapInstanceRef.current;

      // Xóa sạch markers cũ
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Tạo markers mới cho từng điểm thỏa mãn bộ lọc
      filteredPoints.forEach(point => {
        const isSelected = point.id === selectedPointId;
        const isTier2 = point.tier === 2;
        const isTier3 = point.tier === 3;

        const bgColor = isTier2 ? '#2C4939' : (isTier3 ? '#A46C49' : '#5E6B56');
        const badgeText = isTier2 ? 'HTX' : (isTier3 ? 'QR' : 'VÙNG');
        const size = isSelected ? 36 : 30;

        // Tạo phần tử DOM marker
        const el = document.createElement('div');
        el.className = 'custom-cropnet-marker';
        el.style.width = `${size}px`;
        el.style.height = `${size + 8}px`;
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'center';
        el.style.cursor = 'pointer';
        el.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
        el.style.transition = 'transform 0.2s ease';

        el.innerHTML = `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${bgColor};
            border: 2px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            <span style="
              transform: rotate(45deg);
              color: #FFFFFF;
              font-family: inherit;
              font-size: ${isSelected ? '10px' : '9px'};
              font-weight: 700;
              letter-spacing: 0.5px;
            ">
              ${badgeText}
            </span>
          </div>
          <div style="
            width: 6px;
            height: 6px;
            background: #253129;
            opacity: 0.35;
            border-radius: 50%;
            margin-top: -1px;
            filter: blur(1px);
          "></div>
        `;

        const popupNode = createSafePopupNode(point, () => {
          setSelectedPointId(point.id);
        });

        const popup = new Popup({
          offset: [0, -(size + 4)],
          closeButton: false,
          className: 'cropnet-map-popup'
        }).setDOMContent(popupNode);

        const marker = new Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', () => {
          setSelectedPointId(point.id);
        });

        markersRef.current.push(marker);
      });
    }

    updateMarkers();

    return () => {
      isCancelled = true;
    };
  }, [filteredPoints, selectedPointId, mapLoaded, createSafePopupNode]);

  // Thao tác chọn điểm từ danh sách
  const handleSelectPoint = (point: MapPoint) => {
    setSelectedPointId(point.id);

    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.flyTo({
        center: [point.longitude, point.latitude],
        zoom: 12.5,
        essential: true,
        duration: 1200
      });

      // Mở popup tương ứng nếu có
      const idx = filteredPoints.findIndex(p => p.id === point.id);
      if (idx !== -1 && markersRef.current[idx]) {
        markersRef.current[idx].togglePopup();
      }
    }
  };

  // Điều hướng toàn cảnh
  const handleFitEntireDongNai = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([
      DONG_NAI_METROPOLITAN_BOUNDS.southWest,
      DONG_NAI_METROPOLITAN_BOUNDS.northEast
    ], { padding: 40, duration: 1000 });
    setActiveSubRegion('ALL');
  };

  const handleFitSouthDongNai = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([
      DONG_NAI_METROPOLITAN_BOUNDS.southBounds.southWest,
      DONG_NAI_METROPOLITAN_BOUNDS.southBounds.northEast
    ], { padding: 40, duration: 1000 });
    setActiveSubRegion('SOUTH');
  };

  const handleFitNorthDongNai = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([
      DONG_NAI_METROPOLITAN_BOUNDS.northBounds.southWest,
      DONG_NAI_METROPOLITAN_BOUNDS.northBounds.northEast
    ], { padding: 40, duration: 1000 });
    setActiveSubRegion('NORTH');
  };

  // Định vị người dùng (Opt-in)
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Trình duyệt của bạn không hỗ trợ định vị vị trí.');
      return;
    }

    setGeoLocating(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (mapInstanceRef.current) {
          const mod: any = await import('maplibre-gl');
          const Marker = mod.Marker || mod.default?.Marker;
          if (Marker) {
            mapInstanceRef.current.flyTo({
              center: [lng, lat],
              zoom: 13,
              duration: 1200
            });

            // Pulse marker
            const el = document.createElement('div');
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.backgroundColor = '#2C4939';
            el.style.borderRadius = '50%';
            el.style.border = '3px solid #FFFFFF';
            el.style.boxShadow = '0 0 12px rgba(44, 73, 57, 0.8)';

            new Marker({ element: el })
              .setLngLat([lng, lat])
              .addTo(mapInstanceRef.current);
          }
        }
      },
      (err) => {
        setGeoLocating(false);
        if (err.code === 1) {
          setGeoNotice('Bạn đã từ chối quyền chia sẻ vị trí.');
        } else {
          setGeoNotice('Không thể xác định vị trí hiện tại.');
        }
        setTimeout(() => setGeoNotice(null), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar: Bộ lọc phân tầng & Tìm kiếm tiếng Việt */}
      <div className="bg-white rounded-xl border border-[#E2E5DC] p-4 shadow-subtle space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Lớp dữ liệu (3 Tiers) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#647067] flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#2C4939]" />
              Phân cấp dữ liệu:
            </span>

            {[
              { id: 'ALL', label: `Tất cả (${DONG_NAI_MAP_POINTS.length})` },
              { id: 2, label: `Cấp 2: HTX Xác Minh (2)` },
              { id: 3, label: `Cấp 3: Lô Hàng QR (1)` },
              { id: 1, label: `Cấp 1: Vùng Lãnh Thổ (8)` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTier(tab.id as any)}
                className={`text-xs font-medium px-3 py-1.5 rounded-control transition-all ${
                  activeTier === tab.id
                    ? 'bg-[#2C4939] text-white shadow-subtle'
                    : 'bg-[#FAF9F5] text-[#253129] border border-[#E2E5DC] hover:bg-[#F1EFE8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ô tìm kiếm thông minh */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#8C978F] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên, đặc sản, xã/phường..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] rounded-control pl-9 pr-8 py-1.5 text-xs text-[#253129] placeholder-[#8C978F] focus:outline-none focus:border-[#2C4939] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8C978F] hover:text-[#253129]"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Thanh điều hướng tiểu vùng nhanh & Bật tắt Ranh giới */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E5DC] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#647067] font-medium text-[11px] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#A46C49]" />
              Tiểu vùng:
            </span>
            <button
              onClick={handleFitEntireDongNai}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                activeSubRegion === 'ALL'
                  ? 'bg-[#E6EAE4] text-[#2C4939] border-[#2C4939]/30'
                  : 'bg-white text-[#647067] border-[#E2E5DC] hover:bg-[#FAF9F5]'
              }`}
            >
              Toàn TP Đồng Nai
            </button>
            <button
              onClick={handleFitSouthDongNai}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                activeSubRegion === 'SOUTH'
                  ? 'bg-[#E6EAE4] text-[#2C4939] border-[#2C4939]/30'
                  : 'bg-white text-[#647067] border-[#E2E5DC] hover:bg-[#FAF9F5]'
              }`}
            >
              Phía Nam (Biên Hòa - Long Khánh)
            </button>
            <button
              onClick={handleFitNorthDongNai}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                activeSubRegion === 'NORTH'
                  ? 'bg-[#E6EAE4] text-[#2C4939] border-[#2C4939]/30'
                  : 'bg-white text-[#647067] border-[#E2E5DC] hover:bg-[#FAF9F5]'
              }`}
            >
              Phía Bắc (Đồng Xoài - Bù Đăng)
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#647067]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPolygons}
                onChange={e => setShowPolygons(e.target.checked)}
                className="rounded border-[#E2E5DC] text-[#2C4939] focus:ring-0 w-3.5 h-3.5"
              />
              <span>Hiện ranh giới tiểu vùng</span>
            </label>
            <span className="text-[#8C978F] hidden sm:inline">•</span>
            <span className="text-[#8C978F] hidden sm:inline">Engine: MapLibre GL • OpenFreeMap Vector</span>
          </div>
        </div>

        {/* Thông báo lỗi hoặc định vị nếu có */}
        {geoNotice && (
          <div className="bg-[#F8EFEB] border border-[#E9D5C8] text-[#8C3A27] px-3 py-1.5 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{geoNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Main Canvas Grid: Map (65-70%) + Detail Inspector (30-35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Bản đồ Canvas (Left 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E5DC] overflow-hidden shadow-subtle relative flex flex-col">
          {/* Header trên map với OpenFreeMap Vector Switcher */}
          <div className="p-3 bg-[#F1EFE8] border-b border-[#E2E5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2C4939] animate-pulse"></span>
              <span className="font-semibold text-[#253129]">
                Bản Đồ Vector Nông Nghiệp Thành Phố Đồng Nai (Nghị quyết 30/2026/QH16)
              </span>
              <span className="text-[#647067] text-[11px] hidden sm:inline">
                ({filteredPoints.length} điểm hiển thị)
              </span>
            </div>

            {/* Vector Basemap Switcher (Keyless OpenFreeMap) */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-[#E2E5DC]">
              <button
                onClick={() => setBasemap('liberty')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  basemap === 'liberty'
                    ? 'bg-[#2C4939] text-white shadow-subtle'
                    : 'text-[#647067] hover:text-[#253129]'
                }`}
                title="Bản đồ vector tự nhiên Liberty"
              >
                Tiêu chuẩn
              </button>
              <button
                onClick={() => setBasemap('bright')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  basemap === 'bright'
                    ? 'bg-[#2C4939] text-white shadow-subtle'
                    : 'text-[#647067] hover:text-[#253129]'
                }`}
                title="Bản đồ vector tương phản cao Bright"
              >
                Sắc nét
              </button>
              <button
                onClick={() => setBasemap('positron')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  basemap === 'positron'
                    ? 'bg-[#2C4939] text-white shadow-subtle'
                    : 'text-[#647067] hover:text-[#253129]'
                }`}
                title="Bản đồ vector thanh lịch Positron"
              >
                Thanh lịch
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative w-full h-[460px] sm:h-[580px] bg-[#EAECE6]">
            {!webglSupported ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#FAF9F5] z-20 space-y-3">
                <AlertCircle className="w-10 h-10 text-[#A46C49]" />
                <h3 className="font-bold text-[#253129] text-base">Trình duyệt không hỗ trợ WebGL</h3>
                <p className="text-xs text-[#647067] max-w-md">
                  Vui lòng bật tính năng tăng tốc phần cứng trong cài đặt trình duyệt để xem bản đồ vector 3D mượt mà.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#2C4939] text-white rounded text-xs font-medium"
                >
                  Tải lại trang
                </button>
              </div>
            ) : null}

            {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#FAF9F5]/90 z-20 space-y-3">
                <AlertCircle className="w-8 h-8 text-[#A46C49]" />
                <p className="text-xs text-[#647067]">{mapError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-[#2C4939] text-white rounded text-xs"
                >
                  Thử lại
                </button>
              </div>
            )}

            <div
              ref={mapContainerRef}
              className="w-full h-full z-0"
            />

            {/* Custom On-Map Controls (Góc phải trên) */}
            <div className="absolute right-3 top-3 z-[10] flex flex-col gap-1.5">
              <button
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#253129] border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors"
                title="Phóng to"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#253129] border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors"
                title="Thu nhỏ"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => mapInstanceRef.current?.resetNorth()}
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#253129] border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors"
                title="Đặt lại hướng Bắc"
                aria-label="Reset North"
              >
                <Compass className="w-4 h-4" />
              </button>
              <button
                onClick={handleFitEntireDongNai}
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#2C4939] border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors"
                title="Về toàn cảnh Thành phố Đồng Nai"
                aria-label="Fit entire province"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleLocateUser}
                disabled={geoLocating}
                className={`w-8 h-8 bg-white/95 hover:bg-white border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors ${
                  geoLocating ? 'text-[#8C978F] animate-spin' : 'text-[#2C4939]'
                }`}
                title="Định vị vị trí của tôi"
                aria-label="Locate me"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Chú giải nổi góc dưới trái trên map */}
            <div className="absolute left-3 bottom-6 z-[10] bg-white/90 backdrop-blur-sm border border-[#E2E5DC] rounded-lg p-2.5 shadow-subtle text-[11px] text-[#253129] hidden sm:block max-w-[280px]">
              <span className="font-semibold block mb-1.5 text-[#2C4939]">Hệ thống ký hiệu GIS:</span>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2C4939] border border-white"></span>
                  <span>Cấp 2: HTX/Nhà vườn đã xác minh hồ sơ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A46C49] border border-white"></span>
                  <span>Cấp 3: Lô hàng QR có mã đối soát thực</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5E6B56] border border-white"></span>
                  <span>Cấp 1: Vùng nông nghiệp truyền thống (Tâm tham khảo)</span>
                </div>
              </div>
            </div>

            {/* Attribution hợp pháp góc dưới phải */}
            <div className="absolute right-2 bottom-1 z-[10] bg-white/80 px-2 py-0.5 rounded text-[10px] text-[#647067] border border-[#E2E5DC]">
              © <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a>
            </div>
          </div>
        </div>

        {/* Panel Chi Tiết & Danh Sách Vùng (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Chi tiết Điểm đã chọn (Inspector Card) */}
          <div className="bg-white rounded-xl border border-[#E2E5DC] p-5 shadow-subtle space-y-4">
            {/* Header thông tin */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                  activePoint.tier === 2 ? 'bg-[#E6EAE4] text-[#2C4939]' :
                  activePoint.tier === 3 ? 'bg-[#F3E8DF] text-[#A46C49]' : 'bg-[#ECEEE7] text-[#5E6B56]'
                }`}>
                  {activePoint.tierLabel}
                </span>

                <span className="text-[11px] text-[#8C978F] font-mono">
                  {activePoint.latitude.toFixed(4)}°N, {activePoint.longitude.toFixed(4)}°E
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[#253129] leading-snug">
                {activePoint.name}
              </h2>

              <p className="text-xs text-[#647067] flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2C4939] shrink-0 mt-0.5" />
                <span>{activePoint.address}</span>
              </p>
            </div>

            {/* Trạng thái minh bạch dữ liệu (Truth in Data) */}
            <div className={`p-2.5 rounded-control border text-xs ${
              activePoint.verifiedStatus === 'VERIFIED'
                ? 'bg-[#F3F6F3] border-[#D4DFD2] text-[#2C4939]'
                : 'bg-[#F8F9F7] border-[#E2E5DC] text-[#647067]'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
                {activePoint.verifiedStatus === 'VERIFIED' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4939]" />
                    <span>HỒ SƠ ĐÃ ĐỐI SOÁT XÁC MINH</span>
                  </>
                ) : (
                  <>
                    <Info className="w-3.5 h-3.5 text-[#7B876C]" />
                    <span>DỮ LIỆU ĐỊA BÀN THAM KHẢO</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {activePoint.accuracyNote}
              </p>
              {activePoint.verificationSource && (
                <div className="mt-1 pt-1 border-t border-black/5 text-[10px] text-[#647067]">
                  Nguồn: {activePoint.verificationSource}
                </div>
              )}
            </div>

            {/* Ảnh đại diện nếu có */}
            {activePoint.imageUrl && (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#E2E5DC] bg-[#FAF9F5]">
                <img
                  src={activePoint.imageUrl}
                  alt={activePoint.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Mô tả thổ nhưỡng & vùng trồng */}
            <p className="text-xs text-[#647067] leading-relaxed border-t border-[#E2E5DC] pt-3">
              {activePoint.description}
            </p>

            {/* Thông số kỹ thuật nông nghiệp */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-control bg-[#FAF9F5] border border-[#E2E5DC]">
                <span className="text-[10px] text-[#8C978F] block">Thổ nhưỡng</span>
                <span className="font-medium text-[#253129] text-[11px] line-clamp-1">{activePoint.soilType}</span>
              </div>
              <div className="p-2.5 rounded-control bg-[#FAF9F5] border border-[#E2E5DC]">
                <span className="text-[10px] text-[#8C978F] block">Quy mô</span>
                <span className="font-medium text-[#253129] text-[11px]">
                  {activePoint.hectares ? `${activePoint.hectares} Hecta` : 'Toàn tiểu vùng'}
                </span>
                {activePoint.hectaresEstimateNote && (
                  <span className="text-[9px] text-[#8C978F] block truncate" title={activePoint.hectaresEstimateNote}>
                    {activePoint.hectaresEstimateNote}
                  </span>
                )}
              </div>
            </div>

            {/* Đặc sản & Chứng nhận */}
            <div className="space-y-2 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-[#253129] block mb-1">Đặc sản nông nghiệp:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activePoint.specialties.map(spec => (
                    <span key={spec} className="px-2 py-0.5 bg-[#FAF9F5] border border-[#E2E5DC] text-[#253129] rounded text-[11px]">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#253129] block mb-1">Tiêu chuẩn & Hồ sơ:</span>
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

            {/* Action buttons: Chỉ đường Google Maps + Xem sản phẩm + Xem tem QR */}
            <div className="pt-3 border-t border-[#E2E5DC] flex flex-wrap items-center justify-between gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activePoint.latitude},${activePoint.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#2C4939] hover:underline font-semibold"
              >
                <span>Chỉ đường trên Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                {activePoint.relatedProductId && (
                  <Link
                    href={`/products/${activePoint.relatedProductId}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF9F5] hover:bg-[#F1EFE8] text-[#253129] border border-[#E2E5DC] text-[11px] font-medium rounded-control transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3 text-[#2C4939]" />
                    <span>Mua sản phẩm</span>
                  </Link>
                )}

                {activePoint.qrBatchCode && (
                  <Link
                    href={`/traceability/${activePoint.qrBatchCode}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2C4939] hover:bg-[#233C2F] text-white text-[11px] font-medium rounded-control transition-colors shadow-subtle"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Tem QR</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick List: Danh sách các địa bàn phù hợp */}
          <div className="bg-white rounded-xl border border-[#E2E5DC] p-4 shadow-subtle space-y-2 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-[#647067] uppercase tracking-wider mb-1">
              <span>Địa bàn lọc được ({filteredPoints.length})</span>
              {filteredPoints.length < DONG_NAI_MAP_POINTS.length && (
                <button
                  onClick={() => {
                    setActiveTier('ALL');
                    setActiveSubRegion('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[10px] text-[#2C4939] lowercase hover:underline"
                >
                  đặt lại bộ lọc
                </button>
              )}
            </div>

            {filteredPoints.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8C978F]">
                Không tìm thấy địa bàn nào phù hợp với từ khóa.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPoints.map(point => (
                  <button
                    key={point.id}
                    onClick={() => handleSelectPoint(point)}
                    className={`w-full text-left p-2 rounded-control text-xs transition-colors flex items-center justify-between ${
                      point.id === selectedPointId
                        ? 'bg-[#E6EAE4] text-[#2C4939] font-semibold border border-[#2C4939]/20'
                        : 'hover:bg-[#FAF9F5] text-[#253129]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block truncate">{point.shortName}</span>
                      <span className="text-[10px] text-[#8C978F] block truncate">
                        {point.area.split(',')[0]}
                      </span>
                    </div>

                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                      point.tier === 2 ? 'bg-[#E6EAE4] text-[#2C4939]' :
                      point.tier === 3 ? 'bg-[#F3E8DF] text-[#A46C49]' : 'bg-[#ECEEE7] text-[#5E6B56]'
                    }`}>
                      {point.tier === 2 ? 'HTX' : (point.tier === 3 ? 'QR' : 'Vùng')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
