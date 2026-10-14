import { RegionPolygonFeature } from './types';

/**
 * Ranh giới ước lượng địa bàn Thành phố Đồng Nai (mở rộng theo Nghị quyết 30/2026/QH16)
 * Định dạng chuẩn GeoJSON và MapLibre: [kinh độ (lng), vĩ độ (lat)]
 */
export const DONG_NAI_METROPOLITAN_BOUNDS = {
  // MapLibre LngLatBoundsLike: [lng, lat]
  southWest: [106.55, 10.65] as [number, number],
  northEast: [107.55, 12.05] as [number, number],
  center: [107.05, 11.28] as [number, number],
  defaultZoom: 8.8,
  southBounds: {
    southWest: [106.75, 10.65] as [number, number],
    northEast: [107.50, 11.35] as [number, number],
    center: [107.15, 10.98] as [number, number],
    zoom: 9.8
  },
  northBounds: {
    southWest: [106.55, 11.35] as [number, number],
    northEast: [107.45, 12.05] as [number, number],
    center: [106.95, 11.65] as [number, number],
    zoom: 9.6
  }
};

/**
 * Đa giác ranh giới đại diện cho các tiểu vùng chuyên canh đặc thù
 * Tọa độ chuẩn GeoJSON: [longitude, latitude]
 */
export const DONG_NAI_REGION_POLYGONS: RegionPolygonFeature[] = [
  // 1. Cù Lao Tân Triều (Vùng bưởi sông Đồng Nai)
  {
    id: 'poly-tantrieu',
    name: 'Tiểu Vùng Cù Lao Tân Triều (Bưởi Đường Lá Cam)',
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
    description: 'Vùng đất cù lao màu mỡ phù sa sông Đồng Nai, ranh giới tự nhiên bao bọc bởi nhánh sông bồi đắp.'
  },

  // 2. Vùng Đất Đỏ Long Khánh (Sầu riêng & Chôm chôm)
  {
    id: 'poly-longkhanh',
    name: 'Vành Đai Đất Đỏ Long Khánh - Xuân Lập',
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
    description: 'Tiểu vùng đất đỏ bazan cổ phì nhiêu, trung tâm chuyên canh sầu riêng chín cây và cây ăn trái nhiệt đới.'
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
    description: 'Vùng canh tác cây ăn quả và hồ tiêu dưới chân núi Chứa Chan, độ cao và vi khí hậu đặc trưng.'
  },

  // 4. Vùng Hồ Tiêu Cẩm Mỹ
  {
    id: 'poly-cammy',
    name: 'Vùng Đất Đỏ Hồ Tiêu & Sầu Riêng Cẩm Mỹ',
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
    description: 'Vùng thâm canh hồ tiêu và cây ăn quả công nghệ cao phía nam Đồng Nai.'
  },

  // 5. Vùng Vành Đai Rừng Cát Tiên & Tân Phú
  {
    id: 'poly-cattien',
    name: 'Vùng Vành Đai Sinh Thái Vườn Quốc Gia Cát Tiên',
    tier: 1,
    subRegion: 'SOUTH',
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
    description: 'Vùng đệm sinh quyển thuận tự nhiên, bảo vệ hệ sinh thái rừng tự nhiên Cát Tiên.'
  },

  // 6. Vùng Lòng Hồ Thủy Điện Trị An
  {
    id: 'poly-trian',
    name: 'Vùng Bán Ngập Sinh Thái Lòng Hồ Trị An',
    tier: 1,
    subRegion: 'SOUTH',
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
    description: 'Khu vực hồ nước ngọt Trị An và vùng đất bán ngập giàu dinh dưỡng nuôi trồng thủy sản và cây có múi.'
  },

  // 7. Vùng Hạt Điều Đất Đỏ Đồng Xoài (Khu vực phía Bắc)
  {
    id: 'poly-dongxoai',
    name: 'Thủ Phủ Hạt Điều Đất Đỏ Đồng Xoài',
    tier: 1,
    subRegion: 'NORTH',
    center: [106.8833, 11.5333],
    coordinates: [
      [106.820, 11.585],
      [106.940, 11.600],
      [106.950, 11.490],
      [106.860, 11.460],
      [106.810, 11.500],
      [106.820, 11.585]
    ],
    fillColor: '#A46C49',
    strokeColor: '#A46C49',
    description: 'Vùng chuyên canh hạt điều lớn và chế biến nông sản xuất khẩu chủ lực phía Bắc Đồng Nai.'
  },

  // 8. Vùng Nông Lâm Phú Riềng
  {
    id: 'poly-phurieng',
    name: 'Vành Đai Nông Lâm & Điều Sinh Thái Phú Riềng',
    tier: 1,
    subRegion: 'NORTH',
    center: [106.9850, 11.7580],
    coordinates: [
      [106.920, 11.810],
      [107.040, 11.830],
      [107.060, 11.720],
      [106.960, 11.690],
      [106.910, 11.730],
      [106.920, 11.810]
    ],
    fillColor: '#7B876C',
    strokeColor: '#7B876C',
    description: 'Địa bàn đồi lượn sóng kết hợp điều, cao su và sầu riêng hữu cơ.'
  },

  // 9. Vùng Nông Nghiệp CNC Chơn Thành
  {
    id: 'poly-chonthanh',
    name: 'Khu Vực Nông Nghiệp Công Nghệ Cao Chơn Thành',
    tier: 1,
    subRegion: 'NORTH',
    center: [106.6680, 11.4720],
    coordinates: [
      [106.610, 11.520],
      [106.720, 11.530],
      [106.730, 11.430],
      [106.640, 11.410],
      [106.600, 11.450],
      [106.610, 11.520]
    ],
    fillColor: '#2C4939',
    strokeColor: '#2C4939',
    description: 'Cửa ngõ kết nối Tây Nam Bộ, ứng dụng nhà màng thông minh và nông nghiệp tuần hoàn.'
  },

  // 10. Vùng Sầu Riêng Đồi Cao Bù Đăng
  {
    id: 'poly-budang',
    name: 'Vùng Sầu Riêng & Điều Cổ Thụ Đồi Cao Bù Đăng',
    tier: 1,
    subRegion: 'NORTH',
    center: [107.2420, 11.7650],
    coordinates: [
      [107.170, 11.830],
      [107.310, 11.850],
      [107.330, 11.720],
      [107.220, 11.680],
      [107.160, 11.725],
      [107.170, 11.830]
    ],
    fillColor: '#A46C49',
    strokeColor: '#A46C49',
    description: 'Độ cao trên 300m so với mực nước biển, chất lượng sầu riêng cơm vàng hạt lép và điều hạt to đồng đều.'
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
