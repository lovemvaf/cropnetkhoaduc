import * as forumRepository from './forum.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

export const getPosts = async (filters: {
  search?: string;
  tag?: string;
  type?: string;
  status?: string;
  authorId?: string;
  sort?: string;
  userId?: string;
}) => {
  return await forumRepository.findPosts(filters);
};

export const getPostById = async (id: string, userId?: string) => {
  const post = await forumRepository.findPostById(id, userId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }
  return post;
};

export const createPost = async (
  authorId: string,
  authorRole: string,
  data: { title: string; content: string; type?: string; tags?: string[]; status?: string }
) => {
  // Validate and assign post type based on user role
  let type = data.type || 'POST';
  
  if (authorRole === 'ADMIN') {
    if (!data.type) type = 'ANNOUNCEMENT';
  } else if (authorRole === 'FARMER' || authorRole === 'SUPPLIER') {
    const allowed = ['FARM_STORY', 'TIP', 'EDUCATION', 'SUSTAINABILITY', 'POST'];
    if (!allowed.includes(type)) {
      type = 'FARM_STORY';
    }
  } else {
    // CUSTOMER / LOGISTICS / INSPECTOR
    const allowed = ['POST', 'RECIPE'];
    if (!allowed.includes(type)) {
      type = 'POST';
    }
  }

  return await forumRepository.insertPost({
    title: data.title,
    content: data.content,
    type,
    status: data.status || 'PUBLISHED', // 'PUBLISHED' | 'DRAFT'
    tags: data.tags || [],
    authorId
  });
};

export const updatePost = async (
  postId: string,
  userId: string,
  userRole: string,
  data: { title?: string; content?: string; type?: string; status?: string; tags?: string[] }
) => {
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }

  // Only author can edit post
  const isAuthor = post.authorId === userId;
  if (userRole !== 'ADMIN' && !isAuthor) {
    throw new ForbiddenError('Bạn không có quyền sửa bài viết này');
  }

  // Enforce types by role if changed
  if (data.type) {
    let type = data.type;
    if (userRole === 'ADMIN') {
      // Allow any type
    } else if (userRole === 'FARMER' || userRole === 'SUPPLIER') {
      const allowed = ['FARM_STORY', 'TIP', 'EDUCATION', 'SUSTAINABILITY', 'POST'];
      if (!allowed.includes(type)) type = 'FARM_STORY';
    } else {
      const allowed = ['POST', 'RECIPE'];
      if (!allowed.includes(type)) type = 'POST';
    }
    data.type = type;
  }

  const updated = await forumRepository.updatePostInDb(postId, data);
  if (!updated) {
    throw new NotFoundError('Cập nhật bài viết thất bại');
  }
  return updated;
};

export const deletePost = async (postId: string, userId: string, userRole: string, userEmail: string, userFullName?: string) => {
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }

  // Only Admin or author can delete
  const isAuthor = post.authorId === userId || post.authorName === userFullName || post.authorName === userEmail;
  if (userRole !== 'ADMIN' && !isAuthor) {
    throw new ForbiddenError('Bạn không có quyền xóa bài viết này');
  }

  await forumRepository.deletePostFromDb(postId);
};

export const togglePinPost = async (postId: string) => {
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }
  const nextPin = !post.isPinned;
  await forumRepository.updatePostPinInDb(postId, nextPin);
};

export const addComment = async (postId: string, authorId: string, content: string, parentId?: string | null) => {
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }
  return await forumRepository.insertComment(postId, authorId, content, parentId);
};

export const toggleLike = async (postId: string, userId: string) => {
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }
  return await forumRepository.toggleLikePost(postId, userId);
};

export const toggleBookmark = async (postId: string, userId: string) => {
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }
  return await forumRepository.toggleBookmarkPost(postId, userId);
};

export const reportPost = async (reporterId: string, postId: string, reason: string) => {
  if (!reason || reason.trim() === '') {
    throw new BadRequestError('Vui lòng điền lý do báo cáo');
  }
  const post = await forumRepository.findPostById(postId);
  if (!post) {
    throw new NotFoundError('Không tìm thấy bài viết');
  }
  return await forumRepository.insertReport(reporterId, { postId, reason });
};

export const reportComment = async (reporterId: string, commentId: string, reason: string) => {
  if (!reason || reason.trim() === '') {
    throw new BadRequestError('Vui lòng điền lý do báo cáo');
  }
  return await forumRepository.insertReport(reporterId, { commentId, reason });
};

// Moderation
export const getReports = async (userRole: string) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Chỉ Admin mới có quyền truy cập báo cáo kiểm duyệt');
  }
  return await forumRepository.findAllReports();
};

export const resolveReport = async (userRole: string, reportId: string, action: 'DISMISS' | 'HIDE' | 'DELETE') => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Chỉ Admin mới có quyền xử lý báo cáo kiểm duyệt');
  }
  
  if (action === 'DISMISS') {
    await forumRepository.updateReportStatusInDb(reportId, 'RESOLVED');
  } else if (action === 'HIDE') {
    const reports = await forumRepository.findAllReports();
    const matchReport = reports.find(r => r.id === reportId);
    if (matchReport) {
      if (matchReport.postId) {
        await forumRepository.updatePostInDb(matchReport.postId, { status: 'HIDDEN' });
      } else if (matchReport.commentId) {
        await forumRepository.updateCommentStatusInDb(matchReport.commentId, 'HIDDEN');
      }
    }
    await forumRepository.updateReportStatusInDb(reportId, 'RESOLVED');
  } else if (action === 'DELETE') {
    const reports = await forumRepository.findAllReports();
    const matchReport = reports.find(r => r.id === reportId);
    if (matchReport) {
      if (matchReport.postId) {
        await forumRepository.deletePostFromDb(matchReport.postId);
      } else if (matchReport.commentId) {
        await forumRepository.updateCommentStatusInDb(matchReport.commentId, 'HIDDEN'); // Hidden as safe deletion proxy for nested logic
      }
    }
    await forumRepository.updateReportStatusInDb(reportId, 'RESOLVED');
  }
};

export const deleteComment = async (commentId: string, userId: string, userRole: string) => {
  const comment = await forumRepository.findCommentById(commentId);
  if (!comment) {
    throw new NotFoundError('Không tìm thấy bình luận');
  }

  // Only Admin or comment author can delete
  if (userRole !== 'ADMIN' && comment.authorId !== userId) {
    throw new ForbiddenError('Bạn không có quyền xóa bình luận này');
  }

  await forumRepository.updateCommentStatusInDb(commentId, 'HIDDEN');
};
