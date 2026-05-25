import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepository from './auth.repository';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { logger } from '../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-jwt-key';

export const registerUser = async (data: {
  email: string;
  passwordHash: string; // raw password
  fullName: string;
  phone?: string;
  roleName: string;
  farmName?: string;
  address?: string;
}) => {
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser && !existingUser.id.startsWith('mock-')) {
    throw new BadRequestError('Email đã tồn tại trên hệ thống');
  }

  // Hash password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.passwordHash, salt);

  const user = await authRepository.createUser({
    ...data,
    passwordHash: hashedPassword
  });

  // Generate initial email verification token
  const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
  await authRepository.setUserVerificationToken(data.email, verificationToken);

  logger.info(`[VERIFICATION EMAIL SENT] To: ${data.email} | Token: ${verificationToken}`);

  return {
    ...user,
    verificationToken
  };
};

export const loginUser = async (email: string, passwordTho: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new BadRequestError('Sai tài khoản hoặc mật khẩu');
  }

  const isMatch = await bcrypt.compare(passwordTho, user.passwordHash);
  if (!isMatch) {
    throw new BadRequestError('Sai tài khoản hoặc mật khẩu');
  }

  // Create Access Token (short-lived: 15m)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role.name, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Create Refresh Token (long-lived: 7d)
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Update refresh token in DB
  await authRepository.updateUserRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      status: user.status,
      isEmailVerified: user.isEmailVerified ?? false,
      supplierId: user.supplier?.id || null,
      supplierStatus: user.supplier?.status || null
    }
  };
};

export const refreshUserToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await authRepository.findUserById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return newAccessToken;
  } catch (error) {
    throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  }
};

export const logoutUser = async (userId: string) => {
  await authRepository.updateUserRefreshToken(userId, null);
};

export const requestPasswordReset = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new BadRequestError('Không tìm thấy tài khoản với email này');
  }

  const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  await authRepository.setUserResetPasswordToken(email, resetToken, expires);

  logger.info(`[PASSWORD RESET EMAIL SENT] To: ${email} | Token: ${resetToken}`);

  return {
    resetToken
  };
};

export const resetPassword = async (token: string, passwordTho: string) => {
  const user = await authRepository.findUserByResetToken(token);
  if (!user) {
    throw new BadRequestError('Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordTho, salt);

  await authRepository.updateUserPassword(user.id, hashedPassword);

  return {
    success: true
  };
};

export const verifyUserEmail = async (token: string) => {
  const user = await authRepository.findUserByVerificationToken(token);
  if (!user) {
    throw new BadRequestError('Mã xác minh email không hợp lệ');
  }

  await authRepository.verifyUserEmail(user.id);

  return {
    success: true
  };
};

export const sendVerificationToken = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new BadRequestError('Không tìm thấy tài khoản');
  }

  if (user.isEmailVerified) {
    throw new BadRequestError('Email đã được xác thực trước đó');
  }

  const verificationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
  await authRepository.setUserVerificationToken(email, verificationToken);

  logger.info(`[VERIFICATION EMAIL RESENT] To: ${email} | Token: ${verificationToken}`);

  return {
    verificationToken
  };
};
