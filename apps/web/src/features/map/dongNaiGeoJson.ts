import { RegionPolygonFeature } from './types';

/**
 * Ranh giới địa bàn Tỉnh Đồng Nai
 * Định dạng chuẩn GeoJSON và MapLibre: [kinh độ (lng), vĩ độ (lat)]
 */
export const DONG_NAI_METROPOLITAN_BOUNDS = {
  // MapLibre LngLatBoundsLike: [lng, lat]
  southWest: [106.70, 10.60] as [number, number],
  northEast: [107.60, 11.60] as [number, number],
  center: [107.15, 11.08] as [number, number],
  defaultZoom: 9.0,
  southBounds: {
    southWest: [106.75, 10.65] as [number, number],
    northEast: [107.50, 11.15] as [number, number],
    center: [107.15, 10.95] as [number, number],
    zoom: 9.8
  },
  northBounds: {
    southWest: [106.90, 11.05] as [number, number],
    northEast: [107.60, 11.60] as [number, number],
    center: [107.25, 11.30] as [number, number],
    zoom: 9.6
  }
};

/**
 * Đa giác ranh giới đại diện cho các tiểu vùng chuyên canh đặc thù Tỉnh Đồng Nai
 * Tọa độ chuẩn GeoJSON: [longitude, latitude]
 */
export const DONG_NAI_REGION_POLYGONS: RegionPolygonFeature[] = [
  // 1. Cù Lao Tân Triều (Vùng bưởi sông Đồng Nai - Vĩnh Cửu)
  {
    id: 'poly-tantrieu',
    name: 'Tiểu Vùng Cù Lao Tân Triều (Bưởi Đường Lá Cam & Da Xanh)',
    tier: 1,
    subRegion: 'SOUTH',
    center: [106.8835, 11.0267], // [lng, lat]
    coordinates: [
      [106.865, 11.042],
      [106.885, 11.048],
      [106.905, 11.035],
      [106.898, 11.015],
      [106.872, 11.012],
      [106.860, 11.028],
      [106.865, 11.042] // Đóng vòng polygon
    ],
    fillColor: '#2C4939',
    strokeColor: '#2C4939',
    description: 'Vùng đất cù lao màu mỡ phù sa sông Đồng Nai (Vĩnh Cửu), cái nôi của thương hiệu bưởi đường lá cam và bưởi da xanh Tân Triều nức tiếng.'
  },

  // 2. Vùng Đất Đỏ Long Khánh (Sầu riêng & Chôm chôm)
  {
    id: 'poly-longkhanh',
    name: 'Vành Đai Đất Đỏ Long Khánh - Xuân Lập - Bình Lộc',
    tier: 1,
    subRegion: 'SOUTH',
    center: [107.2412, 10.9258],
    coordinates: [
      [107.200, 10.965],
      [107.275, 10.970],
      [107.290, 10.910],
      [107.230, 10.885],
      [107.195, 10.915],
      [107.200, 10.965]
    ],
    fillColor: '#A46C49',
    strokeColor: '#A46C49',
    description: 'Tiểu vùng đất đỏ bazan cổ phì nhiêu, thủ phủ cây ăn trái nhiệt đới Đồng Nai với sầu riêng Ri6 chín cây và chôm chôm nhãn đạt Chỉ dẫn địa lý.'
  },

  // 3. Vùng Chân Núi Chứa Chan - Xuân Lộc
  {
    id: 'poly-xuanloc',
    name: 'Tiểu Vùng Nông Nghiệp Chân Núi Chứa Chan (Xuân Lộc)',
    tier: 1,
    subRegion: 'SOUTH',
    center: [107.3820, 10.9325],
    coordinates: [
      [107.345, 10.975],
      [107.410, 10.990],
      [107.435, 10.920],
      [107.375, 10.880],
      [107.330, 10.915],
      [107.345, 10.975]
    ],
    fillColor: '#7B876C',
    strokeColor: '#7B876C',
    description: 'Vùng canh tác hồ tiêu hữu cơ, sầu riêng và cây ăn quả chân núi Chứa Chan, vi khí hậu núi cao thoát nước tốt tạo hương vị cay đậm đà.'
  },

  // 4. Vùng Hồ Tiêu Cẩm Mỹ
  {
    id: 'poly-cammy',
    name: 'Vùng Đất Đỏ Hồ Tiêu & Cây Ăn Quả Cẩm Mỹ',
    tier: 1,
    subRegion: 'SOUTH',
    center: [107.2185, 10.7932],
    coordinates: [
      [107.170, 10.840],
      [107.260, 10.845],
      [107.270, 10.760],
      [107.190, 10.745],
      [107.160, 10.785],
      [107.170, 10.840]
    ],
    fillColor: '#7B876C',
    strokeColor: '#7B876C',
    description: 'Vùng chuyên canh hồ tiêu Lâm San và sầu riêng công nghệ cao phía nam tỉnh Đồng Nai, thương hiệu Nhãn hiệu tập thể đã khẳng định uy tín.'
  },

  // 5. Vùng Vành Đai Rừng Cát Tiên & Tân Phú
  {
    id: 'poly-cattien',
    name: 'Vùng Vành Đai Sinh Thái Vườn Quốc Gia Cát Tiên & Tân Phú',
    tier: 1,
    subRegion: 'NORTH',
    center: [107.4268, 11.4285],
    coordinates: [
      [107.380, 11.485],
      [107.470, 11.510],
      [107.495, 11.410],
      [107.415, 11.370],
      [107.365, 11.405],
      [107.380, 11.485]
    ],
    fillColor: '#2C4939',
    strokeColor: '#2C4939',
    description: 'Vùng đệm Khu dự trữ sinh quyển thế giới Đồng Nai, canh tác thuận tự nhiên không hóa chất độc hại, bảo vệ nguồn nước thượng nguồn.'
  },

  // 6. Vùng Lòng Hồ Thủy Điện Trị An & Vĩnh Cửu
  {
    id: 'poly-trian',
    name: 'Vùng Bán Ngập Sinh Thái Lòng Hồ Trị An & Vĩnh Cửu',
    tier: 1,
    subRegion: 'NORTH',
    center: [107.0189, 11.1215],
    coordinates: [
      [106.960, 11.180],
      [107.080, 11.195],
      [107.090, 11.080],
      [107.010, 11.050],
      [106.945, 11.095],
      [106.960, 11.180]
    ],
    fillColor: '#4A6984',
    strokeColor: '#4A6984',
    description: 'Khu vực hồ nước ngọt Trị An và vành đai bán ngập giàu dinh dưỡng nuôi trồng thủy sản nước ngọt và phát triển cây ăn trái sinh thái.'
  },

  // 7. Vùng Hạt Điều & Nông Sản Định Quán
  {
    id: 'poly-dinhquan',
    name: 'Vùng Chuyên Canh Điều & Ca Cao Định Quán',
    tier: 1,
    subRegion: 'NORTH',
    center: [107.1680, 11.2350],
    coordinates: [
      [107.110, 11.280],
      [107.220, 11.290],
      [107.240, 11.180],
      [107.140, 11.160],
      [107.100, 11.210],
      [107.110, 11.280]
    ],
    fillColor: '#A46C49',
    strokeColor: '#A46C49',
    description: 'Vùng đồi bazan phong hóa huyện Định Quán, nổi tiếng với diện tích điều nguyên liệu lâu năm chế biến hạt điều rang củi thủ công chất lượng cao.'
  },

  // 8. Vùng Chuối Cấy Mô & Cây Ăn Trái Thống Nhất
  {
    id: 'poly-thongnhat',
    name: 'Vùng Chuối Già Nam Mỹ & Nông Sản Thống Nhất',
    tier: 1,
    subRegion: 'SOUTH',
    center: [107.1250, 10.9850],
    coordinates: [
      [107.080, 11.020],
      [107.160, 11.030],
      [107.170, 10.940],
      [107.090, 10.930],
      [107.070, 10.970],
      [107.080, 11.020]
    ],
    fillColor: '#2C4939',
    strokeColor: '#2C4939',
    description: 'Khu vực chuyên canh chuối cấy mô công nghệ cao quy mô lớn của tỉnh Đồng Nai, xuất khẩu chính ngạch sang nhiều thị trường quốc tế.'
  }
];

/**
 * Xuất dữ liệu GeoJSON FeatureCollection cho MapLibre GL
 */
export function getRegionsGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: DONG_NAI_REGION_POLYGONS.map(region => ({
      type: 'Feature',
      id: region.id,
      properties: {
        id: region.id,
        name: region.name,
        tier: region.tier,
        subRegion: region.subRegion,
        fillColor: region.fillColor,
        strokeColor: region.strokeColor,
        description: region.description
      },
      geometry: {
        type: 'Polygon',
        coordinates: [region.coordinates]
      }
    }))
  };
}
