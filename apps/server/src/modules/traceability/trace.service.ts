import qrcode from 'qrcode';
import * as traceRepository from './trace.repository';
import * as productRepo from '../product/product.repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

const buildDefaultLogisticsTimeline = (batchCode: string, farmingArea: string) => {
  return [
    {
      status: 'PICKED_UP',
      title: 'Thu hoạch & Đóng gói',
      description: `Lô hàng được thu hoạch từ vườn ${farmingArea} và đóng gói tại xưởng của nhà vườn.`,
      timestamp: new Date().toISOString(),
      location: 'Nhà vườn / Hợp Tác Xã'
    },
    {
      status: 'IN_TRANSIT',
      title: 'Đang vận chuyển trung chuyển',
      description: 'Lô hàng đã được bàn giao và đang vận chuyển bằng container lạnh.',
      timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      location: 'Trên đường vận chuyển'
    },
    {
      status: 'DELIVERED',
      title: 'Cập cảng phân phối D2C',
      description: 'Đã nhập kho trung chuyển trung tâm của CropNet.',
      timestamp: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      location: 'Kho trung chuyển TP. HCM'
    }
  ];
};

const buildDefaultInspectionReports = () => {
  return [
    {
      inspector: 'Bộ phận Kiểm Định Chất lượng CropNet QC',
      status: 'PASSED',
      checkDate: new Date().toISOString(),
      comments: 'Đã hoàn thành kiểm nghiệm các chỉ tiêu an toàn thực phẩm. Sản phẩm đạt độ chín sinh lý, kích thước và màu sắc đạt chuẩn chất lượng loại A.',
      metrics: {
        pesticideLevel: '0.0% (Không phát hiện)',
        humidity: '84.5%',
        sugarLevel: '12.0 Brix'
      }
    }
  ];
};

const buildDefaultShipmentInfo = (batchCode: string) => {
  return {
    shipmentId: `SHIP-${batchCode}`,
    carrier: 'CropNet Logistics Fleet',
    vehicle: 'Xe tải lạnh chuyên dụng - BKS 51C-888.88',
    currentTemp: '4.8°C',
    humidity: '76.2%',
    departureDate: new Date().toISOString(),
    arrivalDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  };
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
}) => {
  const publicUrl = `https://cropnet.vn/traceability/${data.batchCode}`;
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
    const publicUrl = `https://cropnet.vn/traceability/${data.batchCode}`;
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
  const traceabilityUrl = `${frontendOrigin}/traceability/${batchCode}`;

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

  const publicUrl = `${frontendOrigin}/traceability/${batch.batchCode}`;
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
