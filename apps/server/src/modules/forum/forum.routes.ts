import { Router } from 'express';
import * as forumController from './forum.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', forumController.getPosts);
router.get('/:id', forumController.getPostById);

// Protected routes (require login)
router.post('/', authMiddleware, forumController.createPost);
router.put('/:id', authMiddleware, forumController.updatePost);
router.delete('/:id', authMiddleware, forumController.deletePost);
router.put('/:id/pin', authMiddleware, forumController.togglePinPost);
router.post('/:id/like', authMiddleware, forumController.toggleLikePost);
router.post('/:id/bookmark', authMiddleware, forumController.toggleBookmarkPost);
router.post('/:id/comments', authMiddleware, forumController.addComment);
router.post('/:id/report', authMiddleware, forumController.reportPost);
router.post('/comments/:commentId/report', authMiddleware, forumController.reportComment);
router.delete('/comments/:commentId', authMiddleware, forumController.deleteComment);

// Admin Moderation routes
router.get('/admin/reports', authMiddleware, roleMiddleware(['ADMIN']), forumController.getReports);
router.put('/admin/reports/:reportId/resolve', authMiddleware, roleMiddleware(['ADMIN']), forumController.resolveReport);

export default router;
