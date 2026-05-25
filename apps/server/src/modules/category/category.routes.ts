import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from './category.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    body('name').notEmpty().withMessage('Tên danh mục không được để trống'),
    body('slug').notEmpty().withMessage('Slug danh mục không được để trống'),
    validate
  ],
  categoryController.createCategory
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  [
    body('name').notEmpty().withMessage('Tên danh mục không được để trống'),
    body('slug').notEmpty().withMessage('Slug danh mục không được để trống'),
    validate
  ],
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  categoryController.deleteCategory
);

export default router;
