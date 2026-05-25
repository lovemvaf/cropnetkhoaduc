import { Router } from 'express';
import * as traceController from './trace.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.get('/batches', traceController.listBatches);
router.get('/batches/:batchCode', traceController.getBatchInfo);
router.get('/batches/:batchCode/qr', traceController.getBatchQR);
router.post('/batches', authMiddleware, roleMiddleware(['FARMER']), traceController.createBatch);
router.put('/batches/:id', authMiddleware, roleMiddleware(['FARMER', 'INSPECTOR']), traceController.updateBatch);
router.delete('/batches/:id', authMiddleware, roleMiddleware(['FARMER']), traceController.deleteBatch);
router.post('/batches/:id/regenerate', authMiddleware, roleMiddleware(['FARMER']), traceController.regenerateQR);
router.post('/batches/:batchCode/certifications', authMiddleware, roleMiddleware(['INSPECTOR']), traceController.addBatchCertification);

export default router;
