import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as paymentService from './payment.service';
import { UnauthorizedError } from '../../utils/errors';

export const createMomoPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { orderId } = req.body;
    const data = await paymentService.createMomoPayment(orderId, req.user);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const momoCallback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Chưa đăng nhập');
    }
    const { orderId, resultCode, transId } = req.body;
    await paymentService.processMomoCallback(orderId, resultCode, transId, req.user);
    res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    next(error);
  }
};
