import { RegionPolygonFeature } from './types';

/**
 * Ranh giới ước lượng địa bàn Thành phố Đồng Nai (mở rộng theo Nghị quyết 30/2026/QH16)
 * Tọa độ WGS84 [vĩ độ (lat), kinh độ (lng)]
 */
export const DONG_NAI_METROPOLITAN_BOUNDS = {
  southWest: [10.65, 106.55] as [number, number],
  northEast: [12.05, 107.55] as [number, number],
  center: [11.28, 107.05] as [number, number],
  defaultZoom: 9,
  southBounds: {
    southWest: [10.65, 106.75] as [number, number],
    northEast: [11.35, 107.50] as [number, number],
    center: [10.98, 107.15] as [number, number],
    zoom: 10
  },
  northBounds: {
    southWest: [11.35, 106.55] as [number, number],
    northEast: [12.05, 107.45] as [number, number],
    center: [11.65, 106.95] as [number, number],
    zoom: 10
  }
};

/**
 * Đa giác ranh giới đại diện cho các tiểu vùng chuyên canh đặc thù
 * Tọa độ WGS84 dạng [latitude, longitude] tương thích Leaflet
 */
export const DONG_NAI_REGION_POLYGONS: RegionPolygonFeature[] = [
  // 1. Cù Lao Tân Triều (Vùng bưởi sông Đồng Nai)
  {
    id: 'poly-tantrieu',
    name: 'Tiểu Vùng Cù Lao Tân Triều (Bưởi Đường Lá Cam)',
    tier: 1,
    subRegion: 'SOUTH',
    center: [11.0267, 106.8835],
    coordinates: [
      [11.042, 106.865],
      [11.048, 106.885],
      [11.035, 106.905],
      [11.015, 106.898],
      [11.012, 106.872],
      [11.028, 106.860]
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
    center: [10.9258, 107.2412],
    coordinates: [
      [10.965, 107.200],
      [10.970, 107.275],
      [10.910, 107.290],
      [10.885, 107.230],
      [10.915, 107.195]
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
    center: [10.9325, 107.3820],
    coordinates: [
      [10.975, 107.345],
      [10.990, 107.410],
      [10.920, 107.435],
      [10.880, 107.375],
      [10.915, 107.330]
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
    center: [10.7932, 107.2185],
    coordinates: [
      [10.840, 107.170],
      [10.845, 107.260],
      [10.760, 107.270],
      [10.745, 107.190],
      [10.785, 107.160]
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
    center: [11.4285, 107.4268],
    coordinates: [
      [11.485, 107.380],
      [11.510, 107.470],
      [11.410, 107.495],
      [11.370, 107.415],
      [11.405, 107.365]
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
    center: [11.1215, 107.0189],
    coordinates: [
      [11.180, 106.960],
      [11.195, 107.080],
      [11.080, 107.090],
      [11.050, 107.010],
      [11.095, 106.945]
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
    center: [11.5333, 106.8833],
    coordinates: [
      [11.585, 106.820],
      [11.600, 106.940],
      [11.490, 106.950],
      [11.460, 106.860],
      [11.500, 106.810]
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
    center: [11.7580, 106.9850],
    coordinates: [
      [11.810, 106.920],
      [11.830, 107.040],
      [11.720, 107.060],
      [11.690, 106.960],
      [11.730, 106.910]
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
    center: [11.4720, 106.6680],
    coordinates: [
      [11.520, 106.610],
      [11.530, 106.720],
      [11.430, 106.730],
      [11.410, 106.640],
      [11.450, 106.600]
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
    center: [11.7650, 107.2420],
    coordinates: [
      [11.830, 107.170],
      [11.850, 107.310],
      [11.720, 107.330],
      [11.680, 107.220],
      [11.725, 107.160]
    ],
    fillColor: '#A46C49',
    strokeColor: '#A46C49',
    description: 'Độ cao trên 300m so với mực nước biển, chất lượng sầu riêng cơm vàng hạt lép và điều hạt to đồng đều.'
  }
];
