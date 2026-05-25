import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as forumService from './forum.service';
import { UnauthorizedError, BadRequestError, ForbiddenError } from '../../utils/errors';
import jwt from 'jsonwebtoken';

// Helper to extract userId optionally from token for public routes
const getUserIdFromHeader = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key';
    const decoded = jwt.verify(token, secret) as { id: string };
    return decoded.id;
  } catch (error) {
    return undefined;
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, tag, type, status, authorId, sort } = req.query;
    const userId = getUserIdFromHeader(req);
    
    const data = await forumService.getPosts({
      search: search ? String(search) : undefined,
      tag: tag ? String(tag) : undefined,
      type: type ? String(type) : undefined,
      status: status ? String(status) : undefined,
      authorId: authorId ? String(authorId) : undefined,
      sort: sort ? String(sort) : undefined,
      userId
    });
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromHeader(req);
    const data = await forumService.getPostById(id, userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, type, tags, status } = req.body;
    if (!title || !content) {
      throw new BadRequestError('Tiêu đề và nội dung không được để trống');
    }

    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');

    const data = await forumService.createPost(user.id, user.role, { title, content, type, tags, status });
    res.status(201).json({ success: true, message: 'Đăng bài thảo luận thành công!', data });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, type, tags, status } = req.body;
    
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');

    const data = await forumService.updatePost(id, user.id, user.role, { title, content, type, tags, status });
    res.status(200).json({ success: true, message: 'Cập nhật bài viết thành công!', data });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');

    await forumService.deletePost(id, user.id, user.role, user.email, user.fullName);
    res.status(200).json({ success: true, message: 'Đã xóa bài viết thành công!' });
  } catch (error) {
    next(error);
  }
};

export const togglePinPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ Admin mới có quyền ghim bài viết');
    }

    await forumService.togglePinPost(id);
    res.status(200).json({ success: true, message: 'Cập nhật trạng thái ghim thành công!' });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    if (!content) {
      throw new BadRequestError('Nội dung bình luận không được bỏ trống');
    }

    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');

    const data = await forumService.addComment(id, user.id, content, parentId);
    res.status(200).json({ success: true, message: 'Đã gửi bình luận thành công!', data });
  } catch (error) {
    next(error);
  }
};

export const toggleLikePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    
    const data = await forumService.toggleLike(id, user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmarkPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    
    const data = await forumService.toggleBookmark(id, user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const reportPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    
    await forumService.reportPost(user.id, id, reason);
    res.status(200).json({ success: true, message: 'Báo cáo bài viết thành công!' });
  } catch (error) {
    next(error);
  }
};

export const reportComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    
    await forumService.reportComment(user.id, commentId, reason);
    res.status(200).json({ success: true, message: 'Báo cáo bình luận thành công!' });
  } catch (error) {
    next(error);
  }
};

// Moderation
export const getReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    
    const data = await forumService.getReports(user.role);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body; // 'DISMISS' | 'HIDE' | 'DELETE'
    if (!action) throw new BadRequestError('Thiếu thao tác giải quyết');
    
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');
    
    await forumService.resolveReport(user.role, reportId, action);
    res.status(200).json({ success: true, message: 'Đã giải quyết báo cáo kiểm duyệt!' });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const user = req.user;
    if (!user) throw new UnauthorizedError('Chưa đăng nhập');

    await forumService.deleteComment(commentId, user.id, user.role);
    res.status(200).json({ success: true, message: 'Đã xóa bình luận thành công!' });
  } catch (error) {
    next(error);
  }
};
