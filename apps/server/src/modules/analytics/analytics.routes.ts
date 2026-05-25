import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authMiddleware, analyticsController.getDashboardData);
router.get('/export', authMiddleware, analyticsController.exportReport);

export default router;
