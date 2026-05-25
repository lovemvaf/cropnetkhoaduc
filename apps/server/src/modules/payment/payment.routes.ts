import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/momo/create', authMiddleware, paymentController.createMomoPayment);
router.post('/momo/callback', authMiddleware, paymentController.momoCallback);

export default router;
