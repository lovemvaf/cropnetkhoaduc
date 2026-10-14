import qrcode from 'qrcode';
import * as traceRepository from './trace.repository';
import * as productRepo from '../product/product.repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export const getFrontendOrigin = (overrideOrigin?: string): string => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (overrideOrigin && overrideOrigin.startsWith('http')) return overrideOrigin.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' 
    ? 'https://lovemvaf.github.io/cropnetkhoaduc' 
    : 'http://localhost:3000';
};

export const getBatchTraceabilityUrl = (batchCode: string, origin?: string): string => {
  const base = getFrontendOrigin(origin);
  return `${base}/traceability/?batch=${encodeURIComponent(batchCode)}`;
};

const buildDefaultLogisticsTimeline = (batchCode: string, farmingArea: string) => {
  return [
    {
      status: 'REGISTERED',
      title: 'Đăng ký thông tin lô hàng',
      description: `Lô hàng được khai báo thông tin ban đầu tại ${farmingArea}.`,
      timestamp: new Date().toISOString(),
      location: 'Nhà vườn / Hợp tác xã (Thành phố Đồng Nai)'
    }
  ];
};

const buildDefaultInspectionReports = () => {
  // Truthful baseline: Empty until verified by third-party inspection agency or official lab report.
  // Never fabricate PASSED or 0.0% pesticide residues.
  return [];
};

const buildDefaultShipmentInfo = (batchCode: string) => {
  // Truthful baseline: Null until an actual logistics partner or farmer dispatches a shipment.
  return null;
};

export const findBatchByCode = async (batchCode: string) => {
  const batch = await traceRepository.findBatchByCode(batchCode);
  if (!batch) {
    throw new NotFoundError('Không tìm thấy lô hàng tương ứng');
  }
  return batch;
};

export const createTraceBatch = async (data: {
  productId: string;
  batchCode: string;
  harvestDate: Date;
  farmingArea: string;
  farmingProcess?: string;
  certName?: string;
  certIssuer?: string;
  certValidUntil?: Date;
  certImageUrl?: string;
  logisticsTimeline?: any;
  inspectionReports?: any;
  shipmentInfo?: any;
  frontendOrigin?: string;
}) => {
  const publicUrl = getBatchTraceabilityUrl(data.batchCode, data.frontendOrigin);
  const qrCodeDataUrl = await qrcode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'H',
    width: 512
  });

  const logistics = data.logisticsTimeline || buildDefaultLogisticsTimeline(data.batchCode, data.farmingArea);
  const inspection = data.inspectionReports || buildDefaultInspectionReports();
  const shipment = data.shipmentInfo || buildDefaultShipmentInfo(data.batchCode);

  return await traceRepository.insertTraceBatch({
    ...data,
    qrCodeUrl: qrCodeDataUrl,
    logisticsTimeline: logistics,
    inspectionReports: inspection,
    shipmentInfo: shipment
  });
};

export const editTraceBatch = async (
  id: string,
  supplierId: string | undefined,
  role: string,
  data: {
    batchCode?: string;
    harvestDate?: Date;
    farmingArea?: string;
    farmingProcess?: string;
    logisticsTimeline?: any;
    inspectionReports?: any;
    shipmentInfo?: any;
  }
) => {
  const batch = await traceRepository.findBatchByCode(id);
  if (!batch) throw new NotFoundError('Không tìm thấy lô hàng');

  if (role === 'FARMER') {
    const product = await productRepo.findProductById(batch.productId);
    if (!product) throw new NotFoundError('Sản phẩm liên kết không tồn tại');

    const productSupplierId = product.supplierId || (product.supplier as any)?.id;
    if (productSupplierId !== supplierId) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa lô hàng của nhà vườn khác');
    }
  }

  let qrCodeUrl = batch.qrCodeUrl;
  if (data.batchCode && data.batchCode !== batch.batchCode) {
    const publicUrl = getBatchTraceabilityUrl(data.batchCode);
    qrCodeUrl = await qrcode.toDataURL(publicUrl, {
      errorCorrectionLevel: 'H',
      width: 512
    });
  }

  return await traceRepository.updateTraceBatch(batch.id, {
    ...data,
    ...(data.batchCode && data.batchCode !== batch.batchCode && { qrCodeUrl })
  });
};

export const removeTraceBatch = async (id: string, supplierId: string) => {
  const batch = await traceRepository.findBatchByCode(id);
  if (!batch) throw new NotFoundError('Không tìm thấy lô hàng');

  const product = await productRepo.findProductById(batch.productId);
  if (!product) throw new NotFoundError('Sản phẩm liên kết không tồn tại');

  const productSupplierId = product.supplierId || (product.supplier as any)?.id;
  if (productSupplierId !== supplierId) {
    throw new ForbiddenError('Bạn không có quyền xóa lô hàng của nhà vườn khác');
  }

  return await traceRepository.deleteTraceBatch(batch.id);
};

export const generateQRData = async (batchCode: string, type: 'png' | 'svg', frontendOrigin: string) => {
  const traceabilityUrl = getBatchTraceabilityUrl(batchCode, frontendOrigin);

  if (type === 'svg') {
    return await qrcode.toString(traceabilityUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4
    });
  } else {
    return await qrcode.toBuffer(traceabilityUrl, {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 1024
    });
  }
};

export const regenerateBatchQR = async (id: string, frontendOrigin: string) => {
  const batch = await traceRepository.findBatchByCode(id);
  if (!batch) throw new NotFoundError('Không tìm thấy lô hàng');

  const publicUrl = getBatchTraceabilityUrl(batch.batchCode, frontendOrigin);
  const qrCodeDataUrl = await qrcode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'H',
    width: 512
  });

  return await traceRepository.updateTraceBatch(batch.id, {
    qrCodeUrl: qrCodeDataUrl
  });
};

export const addCertification = async (batchCode: string, data: { name: string; issuer: string; validUntil: Date; imageUrl: string }) => {
  const batch = await traceRepository.findBatchByCode(batchCode);
  if (!batch) {
    throw new NotFoundError('Không tìm thấy lô hàng tương ứng');
  }

  const cert = await traceRepository.insertCertification(batch.id, data);
  
  if (batch.id.startsWith('mock-')) {
    if (!batch.certifications) batch.certifications = [];
    batch.certifications.push(cert);
  }

  return cert;
};

export const findAllBatches = async (supplierId?: string) => {
  return await traceRepository.findAllBatches(supplierId);
};
