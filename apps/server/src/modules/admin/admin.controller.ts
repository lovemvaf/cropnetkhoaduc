import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getAllUsers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.approveUser(id);
    res.status(200).json({ success: true, message: 'Đã phê duyệt tài khoản thành công!' });
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.blockUser(id);
    res.status(200).json({ success: true, message: 'Đã khóa tài khoản thành công!' });
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.unblockUser(id);
    res.status(200).json({ success: true, message: 'Đã kích hoạt lại tài khoản thành công!' });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getAllProducts();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await adminService.updateProductStatus(id, status);
    res.status(200).json({ success: true, message: 'Cập nhật trạng thái sản phẩm thành công!' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.deleteProduct(id);
    res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi sàn thành công!' });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getAllOrders();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.cancelOrder(id);
    res.status(200).json({ success: true, message: 'Đã hủy đơn hàng thành công!' });
  } catch (error) {
    next(error);
  }
};

export const getAllCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getAllCertificates();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const approveCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.approveCertificate(id);
    res.status(200).json({ success: true, message: 'Đã phê duyệt chứng nhận chất lượng!' });
  } catch (error) {
    next(error);
  }
};

export const rejectCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminService.rejectCertificate(id);
    res.status(200).json({ success: true, message: 'Đã từ chối chứng nhận chất lượng!' });
  } catch (error) {
    next(error);
  }
};
