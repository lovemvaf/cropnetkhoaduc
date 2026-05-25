import { Router } from 'express';
import * as orderController from './order.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getMyOrders);
router.get('/:id', authMiddleware, orderController.getOrderDetails);
router.patch('/:id/status', authMiddleware, roleMiddleware(['FARMER', 'LOGISTICS', 'ADMIN']), orderController.updateOrderStatus);

// Rebuilt Order Lifecycle endpoints
router.post('/:id/confirm', authMiddleware, roleMiddleware(['FARMER']), orderController.confirmSupplierOrderItem);
router.post('/:id/shipment', authMiddleware, roleMiddleware(['LOGISTICS']), orderController.createOrderShipment);
router.post('/:id/shipment/milestone', authMiddleware, roleMiddleware(['LOGISTICS']), orderController.addShipmentMilestone);
router.post('/:id/dispute', authMiddleware, roleMiddleware(['CUSTOMER']), orderController.fileOrderDispute);
router.post('/:id/dispute/resolve', authMiddleware, roleMiddleware(['ADMIN']), orderController.adminResolveDispute);

export default router;
