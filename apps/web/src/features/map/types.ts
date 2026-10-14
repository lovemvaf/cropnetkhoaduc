export type MapTier = 1 | 2 | 3;

export type PointType = 'REGION_CENTER' | 'VERIFIED_COOPERATIVE' | 'QR_BATCH_LOT';

export type VerificationStatus = 'VERIFIED' | 'PENDING_AUDIT' | 'TRADITIONAL_REGION';

export type SubRegion = 'SOUTH' | 'NORTH';

export type BasemapMode = 'liberty' | 'bright' | 'positron' | 'osm_raster';

export interface MapPoint {
  id: string;
  name: string;
  shortName: string;
  tier: MapTier; // 1: Vùng lãnh thổ truyền thống, 2: HTX/Nhà vườn xác minh, 3: Lô hàng QR
  tierLabel: string;
  pointType: PointType;
  subRegion: SubRegion;
  area: string;
  address: string;
  accuracyNote: string;
  latitude: number;
  longitude: number;
  polygonBoundary?: [number, number][]; // [lng, lat]
  established?: string;
  hectares?: number;
  hectaresEstimateNote?: string;
  soilType: string;
  specialties: string[];
  certifications: string[];
  verifiedStatus: VerificationStatus;
  verificationSource?: string;
  verificationDate?: string;
  representative?: string;
  imageUrl?: string;
  description: string;
  qrBatchCode?: string;
  relatedProductId?: string;
  searchKeywords?: string;
}

export interface RegionPolygonFeature {
  id: string;
  name: string;
  tier: MapTier;
  subRegion: SubRegion;
  center: [number, number]; // [lng, lat]
  coordinates: [number, number][]; // [lng, lat]
  fillColor: string;
  strokeColor: string;
  description: string;
}
