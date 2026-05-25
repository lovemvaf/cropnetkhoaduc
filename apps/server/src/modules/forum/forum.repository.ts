import { prisma } from '../../database/client';
import { isDatabaseError, MOCK_FORUM_POSTS } from '../../database/dbFallback';

let mockPostsList = [...MOCK_FORUM_POSTS];
let mockLikesList: any[] = [];
let mockBookmarksList: any[] = [];
let mockReportsList: any[] = [];

// Helper to map DB post to API format
const mapDbPost = (p: any, userId?: string) => {
  const isLiked = userId ? mockLikesList.some(l => l.postId === p.id && l.userId === userId) : false;
  const isBookmarked = userId ? mockBookmarksList.some(b => b.postId === p.id && b.userId === userId) : false;

  // Format comments with nested replies (2 levels max)
  const allComments = p.comments || [];
  const parentComments = allComments
    .filter((c: any) => !c.parentId && c.status === 'PUBLISHED')
    .map((c: any) => {
      const replies = allComments
        .filter((r: any) => r.parentId === c.id && r.status === 'PUBLISHED')
        .map((r: any) => ({
          id: r.id,
          postId: r.postId,
          authorId: r.authorId,
          authorName: r.author?.fullName || r.authorName || 'Thành viên',
          content: r.content,
          status: r.status,
          createdAt: r.createdAt
        }));

      return {
        id: c.id,
        postId: c.postId,
        authorId: c.authorId,
        authorName: c.author?.fullName || c.authorName || 'Thành viên',
        content: c.content,
        status: c.status,
        createdAt: c.createdAt,
        replies
      };
    });

  return {
    id: p.id,
    title: p.title,
    content: p.content,
    authorId: p.authorId,
    authorName: p.author?.fullName || p.authorName || 'Ban Quản Trị',
    authorRole: p.author?.role?.name || p.authorRole || 'ADMIN',
    likes: p.likes,
    isLiked,
    isBookmarked,
    isPinned: p.isPinned,
    type: p.type,
    status: p.status || 'PUBLISHED',
    tags: p.tags || [],
    viewsCount: p.viewsCount || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    commentsCount: parentComments.reduce((acc: number, c: any) => acc + 1 + c.replies.length, 0),
    comments: parentComments
  };
};

export const findPosts = async (filters: {
  search?: string;
  tag?: string;
  type?: string;
  status?: string;
  authorId?: string;
  sort?: string;
  userId?: string;
}) => {
  const { search, tag, type, status, authorId, sort, userId } = filters;
  
  try {
    const whereClause: any = {};
    
    // Status filter - default to PUBLISHED unless admin requests all
    if (status) {
      if (status !== 'ALL') {
        whereClause.status = status;
      }
    } else {
      whereClause.status = 'PUBLISHED';
    }

    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    if (authorId) {
      whereClause.authorId = authorId;
    }

    if (tag) {
      whereClause.tags = { has: tag };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = [];
    if (sort === 'popular') {
      orderBy = [{ likes: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'trending') {
      orderBy = [{ viewsCount: 'desc' }, { likes: 'desc' }, { createdAt: 'desc' }];
    } else {
      // Default / Newest (pins stay first)
      orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
    }

    const posts = await prisma.forumPost.findMany({
      where: whereClause,
      include: {
        author: { select: { fullName: true, role: { select: { name: true } } } },
        comments: {
          include: {
            author: { select: { fullName: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        likesList: userId ? { where: { userId } } : false,
        bookmarks: userId ? { where: { userId } } : false
      },
      orderBy
    });

    return posts.map(p => {
      const isLiked = p.likesList && p.likesList.length > 0;
      const isBookmarked = p.bookmarks && p.bookmarks.length > 0;
      
      const allComments = p.comments || [];
      const parentComments = allComments
        .filter(c => !c.parentId && c.status === 'PUBLISHED')
        .map(c => ({
          id: c.id,
          postId: c.postId,
          authorId: c.authorId,
          authorName: c.author.fullName,
          content: c.content,
          status: c.status,
          createdAt: c.createdAt,
          replies: allComments
            .filter(r => r.parentId === c.id && r.status === 'PUBLISHED')
            .map(r => ({
              id: r.id,
              postId: r.postId,
              authorId: r.authorId,
              authorName: r.author.fullName,
              content: r.content,
              status: r.status,
              createdAt: r.createdAt
            }))
        }));

      return {
        id: p.id,
        title: p.title,
        content: p.content,
        authorId: p.authorId,
        authorName: p.author.fullName,
        authorRole: p.author.role.name,
        likes: p.likes,
        isLiked,
        isBookmarked,
        isPinned: p.isPinned,
        type: p.type,
        status: p.status,
        tags: p.tags,
        viewsCount: p.viewsCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        commentsCount: parentComments.reduce((acc, c) => acc + 1 + c.replies.length, 0),
        comments: parentComments
      };
    });

  } catch (error: any) {
    if (isDatabaseError(error)) {
      // Offline fallback processing
      let result = [...mockPostsList];

      // Filters
      const targetStatus = status || 'PUBLISHED';
      if (targetStatus !== 'ALL') {
        result = result.filter(p => (p.status || 'PUBLISHED') === targetStatus);
      }
      if (type && type !== 'ALL') {
        result = result.filter(p => p.type === type);
      }
      if (authorId) {
        result = result.filter(p => p.authorId === authorId);
      }
      if (tag) {
        result = result.filter(p => p.tags && p.tags.includes(tag));
      }
      if (search) {
        const query = search.toLowerCase();
        result = result.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.content.toLowerCase().includes(query)
        );
      }

      // Sort
      if (sort === 'popular') {
        result.sort((a, b) => b.likes - a.likes);
      } else if (sort === 'trending') {
        result.sort((a, b) => ((b.viewsCount || 0) + b.likes) - ((a.viewsCount || 0) + a.likes));
      } else {
        result.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      return result.map(p => mapDbPost(p, userId));
    }
    throw error;
  }
};

export const findPostById = async (id: string, userId?: string) => {
  try {
    // Increment view counter
    const post = await prisma.forumPost.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
      include: {
        author: { select: { fullName: true, email: true, role: { select: { name: true } } } },
        comments: {
          include: {
            author: { select: { fullName: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        likesList: userId ? { where: { userId } } : false,
        bookmarks: userId ? { where: { userId } } : false
      }
    });

    const isLiked = post.likesList && post.likesList.length > 0;
    const isBookmarked = post.bookmarks && post.bookmarks.length > 0;
    
    const allComments = post.comments || [];
    const parentComments = allComments
      .filter(c => !c.parentId && c.status === 'PUBLISHED')
      .map(c => ({
        id: c.id,
        postId: c.postId,
        authorId: c.authorId,
        authorName: c.author.fullName,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt,
        replies: allComments
          .filter(r => r.parentId === c.id && r.status === 'PUBLISHED')
          .map(r => ({
            id: r.id,
            postId: r.postId,
            authorId: r.authorId,
            authorName: r.author.fullName,
            content: r.content,
            status: r.status,
            createdAt: r.createdAt
          }))
      }));

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.fullName,
      authorRole: post.author.role.name,
      likes: post.likes,
      isLiked,
      isBookmarked,
      isPinned: post.isPinned,
      type: post.type,
      status: post.status,
      tags: post.tags,
      viewsCount: post.viewsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentsCount: parentComments.reduce((acc, c) => acc + 1 + c.replies.length, 0),
      comments: parentComments
    };

  } catch (error: any) {
    if (isDatabaseError(error)) {
      const match = mockPostsList.find(p => p.id === id);
      if (!match) return null;
      match.viewsCount = (match.viewsCount || 0) + 1;
      return mapDbPost(match, userId);
    }
    throw error;
  }
};

export const insertPost = async (data: {
  title: string;
  content: string;
  type: string;
  status?: string;
  tags?: string[];
  authorId: string;
}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.authorId },
      include: { role: true }
    });
    if (!user) throw new Error('User not found');

    const post = await prisma.forumPost.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        status: data.status || 'PUBLISHED',
        tags: data.tags || [],
        authorId: data.authorId
      },
      include: {
        author: { select: { fullName: true, role: { select: { name: true } } } },
        comments: true
      }
    });

    return mapDbPost(post);
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const newPost = {
        id: `post-${Date.now()}`,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorId === 'mock-admin-id' ? 'Ban Quản Trị CropNet' : 'Thành viên Hệ thống',
        authorRole: data.authorId === 'mock-admin-id' ? 'ADMIN' : 'CUSTOMER',
        likes: 0,
        isPinned: false,
        type: data.type,
        status: data.status || 'PUBLISHED',
        tags: data.tags || [],
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        commentsCount: 0,
        comments: []
      };
      mockPostsList.unshift(newPost);
      return mapDbPost(newPost);
    }
    throw error;
  }
};

export const updatePostInDb = async (id: string, data: {
  title?: string;
  content?: string;
  type?: string;
  status?: string;
  tags?: string[];
  isPinned?: boolean;
}) => {
  try {
    const post = await prisma.forumPost.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        author: { select: { fullName: true, role: { select: { name: true } } } },
        comments: {
          include: { author: { select: { fullName: true } } }
        }
      }
    });
    return mapDbPost(post);
  } catch (error: any) {
    if (isDatabaseError(error)) {
      mockPostsList = mockPostsList.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...data,
            updatedAt: new Date()
          };
        }
        return p;
      });
      const match = mockPostsList.find(p => p.id === id);
      return match ? mapDbPost(match) : null;
    }
    throw error;
  }
};

export const deletePostFromDb = async (id: string) => {
  try {
    await prisma.forumPost.delete({ where: { id } });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      mockPostsList = mockPostsList.filter(p => p.id !== id);
      return;
    }
    throw error;
  }
};

export const updatePostPinInDb = async (id: string, isPinned: boolean) => {
  try {
    await prisma.forumPost.update({
      where: { id },
      data: { isPinned }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      mockPostsList = mockPostsList.map(p => p.id === id ? { ...p, isPinned } : p);
      return;
    }
    throw error;
  }
};

export const insertComment = async (postId: string, authorId: string, content: string, parentId?: string | null) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: authorId } });
    if (!user) throw new Error('User not found');

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId,
        content,
        parentId: parentId || null
      },
      include: {
        author: { select: { fullName: true } }
      }
    });

    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorName: comment.author.fullName,
      content: comment.content,
      parentId: comment.parentId,
      status: comment.status,
      createdAt: comment.createdAt
    };
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const commentId = `comment-${Date.now()}`;
      const comment = {
        id: commentId,
        postId,
        authorId,
        authorName: authorId === 'mock-admin-id' ? 'Ban Quản Trị' : 'Người dùng',
        content,
        parentId: parentId || null,
        status: 'PUBLISHED',
        createdAt: new Date()
      };
      
      mockPostsList = mockPostsList.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1,
            comments: [...currentComments, comment]
          };
        }
        return p;
      });
      return comment;
    }
    throw error;
  }
};

export const toggleLikePost = async (postId: string, userId: string) => {
  try {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.postLike.delete({ where: { id: existingLike.id } }),
        prisma.forumPost.update({ where: { id: postId }, data: { likes: { decrement: 1 } } })
      ]);
      const updatedPost = await prisma.forumPost.findUnique({ where: { id: postId } });
      return { liked: false, likesCount: updatedPost?.likes || 0 };
    } else {
      await prisma.$transaction([
        prisma.postLike.create({ data: { postId, userId } }),
        prisma.forumPost.update({ where: { id: postId }, data: { likes: { increment: 1 } } })
      ]);
      const updatedPost = await prisma.forumPost.findUnique({ where: { id: postId } });
      return { liked: true, likesCount: updatedPost?.likes || 0 };
    }
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const matchIndex = mockLikesList.findIndex(l => l.postId === postId && l.userId === userId);
      let liked = false;
      let diff = 0;
      if (matchIndex !== -1) {
        mockLikesList.splice(matchIndex, 1);
        liked = false;
        diff = -1;
      } else {
        mockLikesList.push({ id: `like-${Date.now()}`, postId, userId });
        liked = true;
        diff = 1;
      }

      let likesCount = 0;
      mockPostsList = mockPostsList.map(p => {
        if (p.id === postId) {
          const newLikes = Math.max(0, (p.likes || 0) + diff);
          likesCount = newLikes;
          return { ...p, likes: newLikes };
        }
        return p;
      });

      return { liked, likesCount };
    }
    throw error;
  }
};

export const toggleBookmarkPost = async (postId: string, userId: string) => {
  try {
    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    if (existingBookmark) {
      await prisma.postBookmark.delete({ where: { id: existingBookmark.id } });
      return { bookmarked: false };
    } else {
      await prisma.postBookmark.create({ data: { postId, userId } });
      return { bookmarked: true };
    }
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const matchIndex = mockBookmarksList.findIndex(b => b.postId === postId && b.userId === userId);
      let bookmarked = false;
      if (matchIndex !== -1) {
        mockBookmarksList.splice(matchIndex, 1);
        bookmarked = false;
      } else {
        mockBookmarksList.push({ id: `bookmark-${Date.now()}`, postId, userId });
        bookmarked = true;
      }
      return { bookmarked };
    }
    throw error;
  }
};

export const insertReport = async (reporterId: string, data: { postId?: string; commentId?: string; reason: string }) => {
  try {
    return await prisma.forumReport.create({
      data: {
        reporterId,
        postId: data.postId || null,
        commentId: data.commentId || null,
        reason: data.reason
      }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      const newReport = {
        id: `report-${Date.now()}`,
        reporterId,
        postId: data.postId || null,
        commentId: data.commentId || null,
        reason: data.reason,
        status: 'PENDING',
        createdAt: new Date()
      };
      mockReportsList.push(newReport);
      return newReport;
    }
    throw error;
  }
};

// Admin Moderation
export const findAllReports = async () => {
  try {
    return await prisma.forumReport.findMany({
      include: {
        reporter: { select: { fullName: true, email: true } },
        post: { select: { id: true, title: true, content: true, status: true, author: { select: { fullName: true } } } },
        comment: { select: { id: true, content: true, status: true, author: { select: { fullName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      return mockReportsList.map(r => {
        let postDetail: any = null;
        let commentDetail: any = null;
        
        if (r.postId) {
          const matchPost = mockPostsList.find(p => p.id === r.postId);
          if (matchPost) {
            postDetail = {
              id: matchPost.id,
              title: matchPost.title,
              content: matchPost.content,
              status: matchPost.status || 'PUBLISHED',
              author: { fullName: matchPost.authorName }
            };
          }
        }
        
        if (r.commentId) {
          // search in all post comments
          let foundComment: any = null;
          for (const p of mockPostsList) {
            const matchC = p.comments?.find((c: any) => c.id === r.commentId);
            if (matchC) {
              foundComment = matchC;
              break;
            }
          }
          if (foundComment) {
            commentDetail = {
              id: foundComment.id,
              content: foundComment.content,
              status: foundComment.status || 'PUBLISHED',
              author: { fullName: foundComment.authorName }
            };
          }
        }

        return {
          id: r.id,
          reporterId: r.reporterId,
          reporter: { fullName: r.reporterId === 'mock-customer-id' ? 'Trần Thị Hà Nội' : 'Thành viên', email: 'user@cropnet.vn' },
          postId: r.postId,
          post: postDetail,
          commentId: r.commentId,
          comment: commentDetail,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt
        };
      });
    }
    throw error;
  }
};

export const updateReportStatusInDb = async (reportId: string, status: string) => {
  try {
    return await prisma.forumReport.update({
      where: { id: reportId },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      mockReportsList = mockReportsList.map(r => r.id === reportId ? { ...r, status } : r);
      return { id: reportId, status };
    }
    throw error;
  }
};

export const updateCommentStatusInDb = async (commentId: string, status: string) => {
  try {
    return await prisma.forumComment.update({
      where: { id: commentId },
      data: { status }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      mockPostsList = mockPostsList.map(p => {
        const comments = p.comments || [];
        const updatedComments = comments.map((c: any) => c.id === commentId ? { ...c, status } : c);
        return {
          ...p,
          comments: updatedComments
        };
      });
      return { id: commentId, status };
    }
    throw error;
  }
};

export const findCommentById = async (commentId: string) => {
  try {
    return await prisma.forumComment.findUnique({
      where: { id: commentId },
      include: { author: true }
    });
  } catch (error: any) {
    if (isDatabaseError(error)) {
      for (const p of mockPostsList) {
        const match = (p.comments || []).find((c: any) => c.id === commentId);
        if (match) {
          return {
            id: match.id,
            postId: match.postId,
            authorId: match.authorId,
            authorName: match.authorName,
            content: match.content,
            status: match.status,
            createdAt: match.createdAt
          } as any;
        }
        for (const c of (p.comments || [])) {
          const replyMatch = (c.replies || []).find((r: any) => r.id === commentId);
          if (replyMatch) {
            return {
              id: replyMatch.id,
              postId: replyMatch.postId,
              authorId: replyMatch.authorId,
              authorName: replyMatch.authorName,
              content: replyMatch.content,
              status: replyMatch.status,
              createdAt: replyMatch.createdAt
            } as any;
          }
        }
      }
      return null;
    }
    throw error;
  }
};
