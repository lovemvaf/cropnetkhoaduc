import { Request, Response, NextFunction } from 'express';
import * as traceService from './trace.service';
import * as productService from '../product/product.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

export const getBatchInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await traceService.findBatchByCode(req.params.batchCode);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { productId, batchCode, harvestDate, farmingArea, farmingProcess, certName, certIssuer, certValidUntil, certImageUrl, logisticsTimeline, inspectionReports, shipmentInfo } = req.body;
    
    // Verify that the supplier exists
    const supplier = await productService.getSupplierByUserId(req.user.id);

    // Verify product ownership (IDOR check)
    const product = await productService.getSingleProduct(productId);
    const productSupplierId = product.supplierId || (product.supplier as any)?.id;
    if (productSupplierId !== supplier.id) {
      throw new ForbiddenError('Sản phẩm liên kết không thuộc trang trại của bạn');
    }

    const data = await traceService.createTraceBatch({
      productId,
      batchCode,
      harvestDate: new Date(harvestDate),
      farmingArea,
      farmingProcess,
      certName,
      certIssuer,
      certValidUntil: certValidUntil ? new Date(certValidUntil) : undefined,
      certImageUrl,
      logisticsTimeline,
      inspectionReports,
      shipmentInfo
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { id } = req.params;
    const { batchCode, harvestDate, farmingArea, farmingProcess, logisticsTimeline, inspectionReports, shipmentInfo } = req.body;

    let supplierId: string | undefined;
    if (req.user.role === 'FARMER') {
      const supplier = await productService.getSupplierByUserId(req.user.id);
      supplierId = supplier.id;
    }

    const data = await traceService.editTraceBatch(id, supplierId, req.user.role, {
      batchCode,
      harvestDate: harvestDate ? new Date(harvestDate) : undefined,
      farmingArea,
      farmingProcess,
      logisticsTimeline,
      inspectionReports,
      shipmentInfo
    });

    res.status(200).json({ success: true, data, message: 'Cập nhật lô hàng thành công!' });
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { id } = req.params;
    const supplier = await productService.getSupplierByUserId(req.user.id);

    await traceService.removeTraceBatch(id, supplier.id);
    res.status(200).json({ success: true, message: 'Xóa lô hàng thành công!' });
  } catch (error) {
    next(error);
  }
};

export const getBatchQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchCode } = req.params;
    const type = (req.query.type as 'png' | 'svg') || 'png';
    const download = req.query.download === 'true';

    // Verify batch exists
    const batch = await traceService.findBatchByCode(batchCode);

    // Determine frontend origin dynamically
    let frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referer = req.headers.referer;
    if (referer) {
      try {
        const url = new URL(referer);
        frontendOrigin = url.origin;
      } catch (e) {}
    }

    const qrData = await traceService.generateQRData(batch.batchCode, type, frontendOrigin);

    if (type === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      if (download) {
        res.setHeader('Content-Disposition', `attachment; filename="cropnet-batch-${batch.batchCode}.svg"`);
      }
      return res.status(200).send(qrData);
    } else {
      res.setHeader('Content-Type', 'image/png');
      if (download) {
        res.setHeader('Content-Disposition', `attachment; filename="cropnet-batch-${batch.batchCode}.png"`);
      }
      return res.status(200).send(qrData);
    }
  } catch (error) {
    next(error);
  }
};

export const regenerateQR = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { id } = req.params;

    let frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referer = req.headers.referer;
    if (referer) {
      try {
        const url = new URL(referer);
        frontendOrigin = url.origin;
      } catch (e) {}
    }

    const supplier = await productService.getSupplierByUserId(req.user.id);
    
    // Check ownership
    const batch = await traceService.findBatchByCode(id);
    const product = await productService.getSingleProduct(batch.productId);
    const productSupplierId = product.supplierId || (product.supplier as any)?.id;
    if (productSupplierId !== supplier.id) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa lô hàng của nhà vườn khác');
    }

    const data = await traceService.regenerateBatchQR(id, frontendOrigin);
    res.status(200).json({ success: true, data, message: 'Đã tạo lại mã QR thành công!' });
  } catch (error) {
    next(error);
  }
};

export const addBatchCertification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, issuer, validUntil, imageUrl } = req.body;
    const data = await traceService.addCertification(req.params.batchCode, {
      name,
      issuer,
      validUntil: new Date(validUntil),
      imageUrl
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listBatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { supplierId } = req.query;
    const data = await traceService.findAllBatches(supplierId as string);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
