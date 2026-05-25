import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as analyticsService from './analytics.service';
import { UnauthorizedError, BadRequestError } from '../../utils/errors';

export const getDashboardData = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }

    const { startDate, endDate, categoryId } = req.query;

    let data: any = {};
    if (user.role === 'ADMIN') {
      data = await analyticsService.getAdminAnalytics({
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined
      });
    } else if (user.role === 'FARMER' || user.role === 'SUPPLIER') {
      const supplierId = user.supplierId || 'mock-supplier-id';
      data = await analyticsService.getSupplierAnalytics(supplierId, {
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        categoryId: categoryId ? String(categoryId) : undefined
      });
    } else if (user.role === 'CUSTOMER') {
      data = await analyticsService.getCustomerAnalytics(user.id);
    } else if (user.role === 'LOGISTICS') {
      data = await analyticsService.getLogisticsAnalytics();
    } else if (user.role === 'INSPECTOR') {
      data = await analyticsService.getInspectorAnalytics();
    } else {
      throw new BadRequestError('Vai trò người dùng không hợp lệ cho thống kê');
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }

    const { startDate, endDate, categoryId } = req.query;

    let data: any = {};
    if (user.role === 'ADMIN') {
      data = await analyticsService.getAdminAnalytics({
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined
      });
    } else if (user.role === 'FARMER' || user.role === 'SUPPLIER') {
      const supplierId = user.supplierId || 'mock-supplier-id';
      data = await analyticsService.getSupplierAnalytics(supplierId, {
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        categoryId: categoryId ? String(categoryId) : undefined
      });
    } else {
      throw new BadRequestError('Chỉ Admin hoặc Hộ sản xuất mới được quyền xuất báo cáo CSV');
    }

    const csvContent = analyticsService.exportReportToCSV(user.role, data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cropnet-analytics-report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
