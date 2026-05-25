import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import * as authRepository from './auth.repository';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { UnauthorizedError } from '../../utils/errors';

// Helper to set refresh token in httpOnly secure cookie
const setRefreshTokenCookie = (res: Response, token: string, rememberMe?: boolean) => {
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  if (rememberMe) {
    cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }
  res.cookie('refreshToken', token, cookieOptions);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone, roleName, farmName, address } = req.body;

    const user = await authService.registerUser({
      email,
      passwordHash: password, // Raw password, service hashes it
      fullName,
      phone,
      roleName,
      farmName,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        verificationToken: process.env.NODE_ENV !== 'production' ? user.verificationToken : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, rememberMe } = req.body;
    const { accessToken, refreshToken, user } = await authService.loginUser(email, password);
    
    // Set secure cookie
    setRefreshTokenCookie(res, refreshToken, rememberMe);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }

    const newAccessToken = await authService.refreshUserToken(token);
    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const jwt = require('jsonwebtoken');
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-jwt-key';
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
        await authService.logoutUser(decoded.id);
      } catch (err) {
        // Safe to ignore if JWT is malformed/expired
      }
    }

    // Clear secure cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }

    const user = await authRepository.findUserById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('Tài khoản không tồn tại');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role.name,
        status: user.status,
        isEmailVerified: user.isEmailVerified ?? false,
        supplierId: user.supplier?.id || null,
        supplierStatus: user.supplier?.status || null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.status(200).json({
      success: true,
      message: 'Mã khôi phục mật khẩu đã được gửi đến email của bạn.',
      data: process.env.NODE_ENV !== 'production' ? result : undefined
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công.'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    await authService.verifyUserEmail(token);
    res.status(200).json({
      success: true,
      message: 'Xác minh email thành công.'
    });
  } catch (error) {
    next(error);
  }
};

export const sendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await authService.sendVerificationToken(email);
    res.status(200).json({
      success: true,
      message: 'Mã xác minh email mới đã được gửi.',
      data: process.env.NODE_ENV !== 'production' ? result : undefined
    });
  } catch (error) {
    next(error);
  }
};
