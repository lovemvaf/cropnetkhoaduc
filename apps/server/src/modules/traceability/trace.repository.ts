import { prisma } from '../../database/client';
import { isDatabaseError, MOCK_BATCHES } from '../../database/dbFallback';
import { logger } from '../../utils/logger';

export const findBatchByCode = async (batchCode: string) => {
  try {
    return await prisma.traceBatch.findUnique({
      where: { batchCode },
      include: {
        product: {
          include: {
            supplier: { select: { farmName: true, address: true, latitude: true, longitude: true } }
          }
        },
        certifications: true
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const batch = MOCK_BATCHES.find(b => b.batchCode === batchCode) || MOCK_BATCHES[0];
      return {
        ...batch,
        batchCode
      };
    }
    throw error;
  }
};

export const insertTraceBatch = async (data: {
  productId: string;
  batchCode: string;
  harvestDate: Date;
  farmingArea: string;
  farmingProcess?: string;
  qrCodeUrl?: string;
  certName?: string;
  certIssuer?: string;
  certValidUntil?: Date;
  certImageUrl?: string;
  logisticsTimeline?: any;
  inspectionReports?: any;
  shipmentInfo?: any;
}) => {
  try {
    return await prisma.traceBatch.create({
      data: {
        productId: data.productId,
        batchCode: data.batchCode,
        harvestDate: data.harvestDate,
        farmingArea: data.farmingArea,
        farmingProcess: data.farmingProcess,
        qrCodeUrl: data.qrCodeUrl,
        logisticsTimeline: data.logisticsTimeline,
        inspectionReports: data.inspectionReports,
        shipmentInfo: data.shipmentInfo,
        certifications: data.certName && data.certIssuer && data.certValidUntil && data.certImageUrl ? {
          create: {
            name: data.certName,
            issuer: data.certIssuer,
            validUntil: data.certValidUntil,
            imageUrl: data.certImageUrl
          }
        } : undefined
      },
      include: { certifications: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const newBatch = {
        id: `mock-batch-${Date.now()}`,
        productId: data.productId,
        batchCode: data.batchCode,
        harvestDate: data.harvestDate,
        farmingArea: data.farmingArea,
        farmingProcess: data.farmingProcess,
        qrCodeUrl: data.qrCodeUrl,
        logisticsTimeline: data.logisticsTimeline,
        inspectionReports: data.inspectionReports,
        shipmentInfo: data.shipmentInfo,
        product: {
          name: 'Bưởi Da Xanh Bến Tre',
          supplier: {
            farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn',
            address: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre',
            latitude: 10.2458,
            longitude: 106.1284
          }
        },
        certifications: data.certName ? [
          {
            id: `mock-cert-${Date.now()}`,
            name: data.certName,
            issuer: data.certIssuer,
            validUntil: data.certValidUntil,
            imageUrl: data.certImageUrl
          }
        ] : []
      };
      MOCK_BATCHES.push(newBatch);
      return newBatch;
    }
    throw error;
  }
};

export const insertCertification = async (batchId: string, data: { name: string; issuer: string; validUntil: Date; imageUrl: string }) => {
  try {
    return await prisma.certification.create({
      data: {
        batchId,
        name: data.name,
        issuer: data.issuer,
        validUntil: data.validUntil,
        imageUrl: data.imageUrl,
        status: 'PENDING'
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const newCert = {
        id: `mock-cert-${Date.now()}`,
        name: data.name,
        issuer: data.issuer,
        validUntil: data.validUntil,
        imageUrl: data.imageUrl,
        status: 'PENDING'
      };
      return newCert;
    }
    throw error;
  }
};

export const findAllBatches = async (supplierId?: string) => {
  try {
    const where: any = {};
    if (supplierId) {
      where.product = { supplierId };
    }
    return await prisma.traceBatch.findMany({
      where,
      include: {
        product: {
          include: {
            supplier: { select: { farmName: true, address: true } }
          }
        },
        certifications: true
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      if (supplierId) {
        return MOCK_BATCHES.filter(b => 
          b.productId === supplierId || 
          b.product?.supplierId === supplierId || 
          b.product?.supplier?.id === supplierId
        );
      }
      return MOCK_BATCHES;
    }
    throw error;
  }
};

export const updateTraceBatch = async (id: string, data: {
  batchCode?: string;
  harvestDate?: Date;
  farmingArea?: string;
  farmingProcess?: string;
  qrCodeUrl?: string;
  logisticsTimeline?: any;
  inspectionReports?: any;
  shipmentInfo?: any;
}) => {
  try {
    return await prisma.traceBatch.update({
      where: { id },
      data
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn(`Database connection failed. Simulating in-memory batch update for ID: ${id}`);
      const index = MOCK_BATCHES.findIndex(b => b.id === id || b.batchCode === id);
      if (index !== -1) {
        MOCK_BATCHES[index] = {
          ...MOCK_BATCHES[index],
          ...data
        };
        return MOCK_BATCHES[index];
      }
      return null;
    }
    throw error;
  }
};

export const deleteTraceBatch = async (id: string) => {
  try {
    await prisma.certification.deleteMany({ where: { batchId: id } });
    await prisma.traceBatch.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (isDatabaseError(error)) {
      logger.warn(`Database connection failed. Simulating in-memory batch deletion for ID: ${id}`);
      const index = MOCK_BATCHES.findIndex(b => b.id === id || b.batchCode === id);
      if (index !== -1) {
        MOCK_BATCHES.splice(index, 1);
        return true;
      }
      return false;
    }
    throw error;
  }
};
