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
  Maximize2,
  X,
  AlertCircle,
  FileCheck,
  RotateCcw,
  ShoppingBag,
  QrCode
} from 'lucide-react';
import Link from 'next/link';
import { MapPoint, MapTier, BasemapMode, SubRegion } from './types';
import { DONG_NAI_MAP_POINTS, removeVietnameseTones } from './mapData';
import { DONG_NAI_METROPOLITAN_BOUNDS, DONG_NAI_REGION_POLYGONS } from './dongNaiGeoJson';

export default function InteractiveDongNaiMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polygonsLayerRef = useRef<any>(null);
  const markersMapRef = useRef<{ [id: string]: any }>({});

  const [basemap, setBasemap] = useState<BasemapMode>('voyager');
  const [selectedPointId, setSelectedPointId] = useState<string>('htx-tantrieu');
  const [activeTier, setActiveTier] = useState<MapTier | 'ALL'>('ALL');
  const [activeSubRegion, setActiveSubRegion] = useState<SubRegion | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPolygons, setShowPolygons] = useState(true);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Lọc danh sách điểm theo tier, subRegion và tìm kiếm không dấu
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

  // Cập nhật selectedPointId nếu điểm hiện tại bị lọc mất
  useEffect(() => {
    if (filteredPoints.length > 0 && !filteredPoints.some(p => p.id === selectedPointId)) {
      setSelectedPointId(filteredPoints[0].id);
    }
  }, [filteredPoints, selectedPointId]);

  // Hàm tạo Icon SVG cao cấp theo cấp bậc điểm
  const createMarkerIcon = useCallback((L: any, point: MapPoint, isSelected: boolean) => {
    const isTier2 = point.tier === 2;
    const isTier3 = point.tier === 3;

    // Màu sắc theo chủ đề Earth & Forest
    const bgColor = isTier2 ? '#2C4939' : (isTier3 ? '#A46C49' : '#5E6B56');
    const badgeText = isTier2 ? 'HTX' : (isTier3 ? 'QR' : 'VÙNG');
    const size = isSelected ? 38 : 32;
    const ringBorder = isSelected ? 'ring-4 ring-[#2C4939]/30 scale-110' : '';

    return L.divIcon({
      className: 'custom-cropnet-marker',
      html: `
        <div class="relative cursor-pointer transition-all duration-200 ${ringBorder}" style="
          width: ${size}px;
          height: ${size + 8}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
        ">
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
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          ">
            <span style="
              transform: rotate(45deg);
              color: #FFFFFF;
              font-family: var(--font-sans), sans-serif;
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
            opacity: 0.3;
            border-radius: 50%;
            margin-top: -1px;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [size, size + 8],
      iconAnchor: [size / 2, size + 8],
      popupAnchor: [0, -(size + 10)]
    });
  }, []);

  // Hàm tạo Popup DOM an toàn (Phòng chống triệt để XSS)
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
    tierBadge.style.color = point.tier === 2 ? '#2C4939' : (point.tier === 3 ? '#A46C49' : '#647067');
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

  // Khởi tạo bản đồ 1 lần
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      // Khởi tạo bản đồ trung tâm Thành phố Đồng Nai hiện hành
      const map = L.map(mapContainerRef.current, {
        center: DONG_NAI_METROPOLITAN_BOUNDS.center,
        zoom: DONG_NAI_METROPOLITAN_BOUNDS.defaultZoom,
        minZoom: 8,
        maxZoom: 18,
        scrollWheelZoom: true,
        zoomControl: false // Chúng ta dùng custom zoom controls tinh tế
      });

      mapInstanceRef.current = map;

      // Thêm tile layer mặc định
      const voyagerTile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }
      ).addTo(map);

      tileLayerRef.current = voyagerTile;

      // Layer groups quản lý ranh giới và markers
      const polygonsGroup = L.layerGroup().addTo(map);
      polygonsLayerRef.current = polygonsGroup;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      // Vẽ các đa giác tiểu vùng nông nghiệp
      DONG_NAI_REGION_POLYGONS.forEach(region => {
        const poly = L.polygon(region.coordinates as any, {
          color: region.strokeColor,
          fillColor: region.fillColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(polygonsGroup);

        poly.bindTooltip(region.name, {
          sticky: true,
          className: 'custom-region-tooltip'
        });

        poly.on('click', () => {
          const matchPoint = DONG_NAI_MAP_POINTS.find(p => p.id === region.id.replace('poly-', 'region-') || p.id === region.id.replace('poly-', 'htx-'));
          if (matchPoint) {
            setSelectedPointId(matchPoint.id);
            setMobileDrawerOpen(true);
          }
        });
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

  // Cập nhật lớp nền (Basemap Switcher)
  useEffect(() => {
    async function updateBasemap() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      let newTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';

      if (basemap === 'topo') {
        newTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS';
      } else if (basemap === 'satellite') {
        newTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      }

      const newTile = L.tileLayer(newTileUrl, {
        attribution,
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTile;
    }

    updateBasemap();
  }, [basemap]);

  // Cập nhật đa giác khi người dùng bật/tắt layer
  useEffect(() => {
    if (!polygonsLayerRef.current || !mapInstanceRef.current) return;
    if (showPolygons) {
      if (!mapInstanceRef.current.hasLayer(polygonsLayerRef.current)) {
        mapInstanceRef.current.addLayer(polygonsLayerRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(polygonsLayerRef.current)) {
        mapInstanceRef.current.removeLayer(polygonsLayerRef.current);
      }
    }
  }, [showPolygons]);

  // ĐỒNG BỘ MARKERS THEO BỘ LỌC (SỬA TRIỆT ĐỂ LỖI MARKER KHÔNG ĐỒNG BỘ)
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;

      // Xóa toàn bộ marker cũ trên layer
      markersLayerRef.current.clearLayers();
      markersMapRef.current = {};

      // Tạo marker mới chỉ cho các điểm thỏa mãn filteredPoints
      filteredPoints.forEach(point => {
        const isSelected = point.id === selectedPointId;
        const icon = createMarkerIcon(L, point, isSelected);

        const marker = L.marker([point.latitude, point.longitude], {
          icon,
          title: point.name
        });

        // Tạo nội dung popup an toàn qua DOM
        const popupNode = createSafePopupNode(point, () => {
          setSelectedPointId(point.id);
          setMobileDrawerOpen(true);
        });

        marker.bindPopup(popupNode);

        marker.on('click', () => {
          setSelectedPointId(point.id);
          setMobileDrawerOpen(true);
        });

        markersLayerRef.current.addLayer(marker);
        markersMapRef.current[point.id] = marker;
      });
    }

    updateMarkers();
  }, [filteredPoints, selectedPointId, createMarkerIcon, createSafePopupNode]);

  // Thao tác chọn điểm từ danh sách
  const handleSelectPoint = (point: MapPoint) => {
    setSelectedPointId(point.id);
    setMobileDrawerOpen(true);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([point.latitude, point.longitude], 12, { duration: 1.0 });
      const marker = markersMapRef.current[point.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Điều hướng toàn cảnh (Quick views)
  const handleFitEntireDongNai = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([
      DONG_NAI_METROPOLITAN_BOUNDS.southWest,
      DONG_NAI_METROPOLITAN_BOUNDS.northEast
    ], { padding: [30, 30] });
  };

  const handleFitSouthDongNai = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([
      DONG_NAI_METROPOLITAN_BOUNDS.southBounds.southWest,
      DONG_NAI_METROPOLITAN_BOUNDS.southBounds.northEast
    ], { padding: [30, 30] });
    setActiveSubRegion('SOUTH');
  };

  const handleFitNorthDongNai = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds([
      DONG_NAI_METROPOLITAN_BOUNDS.northBounds.southWest,
      DONG_NAI_METROPOLITAN_BOUNDS.northBounds.northEast
    ], { padding: [30, 30] });
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
          const L = (await import('leaflet')).default;
          mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });

          const userMarker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: '#2C4939',
            color: '#FFFFFF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(mapInstanceRef.current);

          userMarker.bindPopup('Vị trí hiện tại của bạn').openPopup();
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

  // Zoom handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
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

        {/* Thanh điều hướng vùng địa lý nhanh & Bật tắt Ranh giới */}
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
            <span className="text-[#8C978F] hidden sm:inline">Hệ tọa độ: WGS84 (EPSG:4326)</span>
          </div>
        </div>

        {/* Thông báo định vị nếu có */}
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
          {/* Header trên map với Basemap Switcher */}
          <div className="p-3 bg-[#F1EFE8] border-b border-[#E2E5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2C4939] animate-pulse"></span>
              <span className="font-semibold text-[#253129]">
                Bản Đồ Nông Nghiệp Thành Phố Đồng Nai (Nghị quyết 30/2026/QH16)
              </span>
              <span className="text-[#647067] text-[11px] hidden sm:inline">
                ({filteredPoints.length} điểm hiển thị)
              </span>
            </div>

            {/* Basemap Switcher Controls */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-[#E2E5DC]">
              <button
                onClick={() => setBasemap('voyager')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  basemap === 'voyager'
                    ? 'bg-[#2C4939] text-white'
                    : 'text-[#647067] hover:text-[#253129]'
                }`}
                title="Bản đồ tiêu chuẩn CARTO Voyager"
              >
                Tiêu chuẩn
              </button>
              <button
                onClick={() => setBasemap('topo')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  basemap === 'topo'
                    ? 'bg-[#2C4939] text-white'
                    : 'text-[#647067] hover:text-[#253129]'
                }`}
                title="Bản đồ địa hình nông nghiệp ESRI Topo"
              >
                Địa hình
              </button>
              <button
                onClick={() => setBasemap('satellite')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  basemap === 'satellite'
                    ? 'bg-[#2C4939] text-white'
                    : 'text-[#647067] hover:text-[#253129]'
                }`}
                title="Ảnh vệ tinh độ phân giải cao ESRI World Imagery"
              >
                Vệ tinh
              </button>
            </div>
          </div>

          {/* Map Leaflet Container */}
          <div className="relative w-full h-[460px] sm:h-[580px] bg-[#EAECE6]">
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0"
            />

            {/* Custom On-Map Controls (Góc phải trên) */}
            <div className="absolute right-3 top-3 z-[400] flex flex-col gap-1.5">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#253129] border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors"
                title="Phóng to"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#253129] border border-[#E2E5DC] rounded shadow-subtle flex items-center justify-center transition-colors"
                title="Thu nhỏ"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
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
            <div className="absolute left-3 bottom-6 z-[400] bg-white/90 backdrop-blur-sm border border-[#E2E5DC] rounded-lg p-2.5 shadow-subtle text-[11px] text-[#253129] hidden sm:block max-w-[280px]">
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
