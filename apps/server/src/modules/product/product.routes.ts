import { Router } from 'express';
import * as productController from './product.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Cần quyền FARMER
router.post('/', authMiddleware, roleMiddleware(['FARMER']), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware(['FARMER']), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['FARMER']), productController.deleteProduct);

// Reviews routes
router.post('/:productId/reviews', authMiddleware, roleMiddleware(['CUSTOMER']), productController.createReview);
router.patch('/reviews/:id/reply', authMiddleware, roleMiddleware(['FARMER']), productController.replyToReview);

export default router;
