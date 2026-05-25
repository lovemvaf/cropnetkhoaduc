import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
    }

    // Intercept modifications (POST, PUT, PATCH, DELETE) if user status or supplier status is PENDING
    const isModification = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isPending = req.user.status === 'PENDING' || 
                      (req.user.role === 'FARMER' && req.user.supplierStatus === 'PENDING');

    if (isPending && isModification) {
      return res.status(403).json({
        success: false,
        error: 'Tài khoản của bạn đang chờ phê duyệt. Không thể thực hiện các thao tác chỉnh sửa dữ liệu.'
      });
    }

    next();
  };
};
