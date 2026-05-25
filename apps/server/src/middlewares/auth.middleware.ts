import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as authRepository from '../modules/auth/auth.repository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    fullName?: string;
    status: string;
    supplierId?: string | null;
    supplierStatus?: string | null;
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key';
    const decoded = jwt.verify(token, secret) as { id: string; role: string; email: string; fullName?: string };
    
    // Resolve user status dynamically from database or mock context
    const user = await authRepository.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa' });
    }

    req.user = {
      id: user.id,
      role: user.role.name,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      supplierId: user.supplier?.id || null,
      supplierStatus: user.supplier?.status || null
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};
