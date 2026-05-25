import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('fullName').notEmpty().withMessage('Họ tên không được để trống'),
    body('roleName').isIn(['CUSTOMER', 'FARMER', 'LOGISTICS', 'INSPECTOR']).withMessage('Role không hợp lệ'),
    validate
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
    validate
  ],
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    validate
  ],
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Mã khôi phục không được để trống'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
    validate
  ],
  authController.resetPassword
);

router.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Mã xác minh không được để trống'),
    validate
  ],
  authController.verifyEmail
);

router.post(
  '/send-verification',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    validate
  ],
  authController.sendVerification
);

export default router;
