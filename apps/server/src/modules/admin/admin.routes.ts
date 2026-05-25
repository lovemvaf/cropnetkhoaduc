import { Router } from 'express';
import * as adminController from './admin.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

// Protect all admin endpoints with authentication and ADMIN role check
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// Users moderation
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/approve', adminController.approveUser);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);

// Products moderation
router.get('/products', adminController.getAllProducts);
router.put('/products/:id/status', adminController.updateProductStatus);
router.delete('/products/:id', adminController.deleteProduct);

// Orders moderation
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/cancel', adminController.cancelOrder);

// Certificates audit
router.get('/certificates', adminController.getAllCertificates);
router.put('/certificates/:id/approve', adminController.approveCertificate);
router.put('/certificates/:id/reject', adminController.rejectCertificate);

export default router;
