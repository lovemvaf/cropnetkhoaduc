'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Input, Badge } from '@cropnet/ui';
import { 
  MessageSquare, PlusCircle, Pin, Trash2, 
  User, Calendar, AlertCircle, Heart, Bookmark, Share2, 
  Search, Tag, Flag, Edit3, Image, FileText, ChevronDown, 
  ChevronUp, CornerDownRight, X, Sparkles, BookOpen
} from 'lucide-react';
import { apiClient } from '@/shared/services/api';
import { useAuthStore } from '@/shared/stores/auth';
import { formatDate } from '@cropnet/utils';

interface CommentReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
  replies: CommentReply[];
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  isPinned: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  type: 'POST' | 'ANNOUNCEMENT' | 'NEWS' | 'FARM_STORY' | 'RECIPE' | 'TIP' | 'EDUCATION' | 'SUSTAINABILITY';
  status: 'PUBLISHED' | 'DRAFT' | 'HIDDEN';
  tags: string[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ForumPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort state
  const [activeTypeTab, setActiveTypeTab] = useState<string>('ALL');
  const [activeSortTab, setActiveSortTab] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // States for creating/editing a post
  const [isCreating, setIsCreating] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<string>('POST');
  const [postTags, setPostTags] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Expanded posts (comments section)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report Modal states
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Spam');
  const [customReportReason, setCustomReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Alert/Toast states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      let queryUrl = '/forum?';
      if (activeTypeTab !== 'ALL' && activeTypeTab !== 'BOOKMARKS') {
        queryUrl += `type=${activeTypeTab}&`;
      }
      queryUrl += `sort=${activeSortTab}&`;
      if (searchQuery) {
        queryUrl += `search=${encodeURIComponent(searchQuery)}&`;
      }
      if (activeTag) {
        queryUrl += `tag=${encodeURIComponent(activeTag)}&`;
      }
      
      const res = await apiClient.get(queryUrl);
      if (res.data.success) {
        let fetchedData = res.data.data;
        // If BOOKMARKS tab is active, filter only bookmarked posts
        if (activeTypeTab === 'BOOKMARKS') {
          fetchedData = fetchedData.filter((p: ForumPost) => p.isBookmarked);
        }
        setPosts(fetchedData);
      }
    } catch (err: any) {
      console.error('Failed to load forum posts:', err);
      setError('Không thể tải các bài viết lúc này. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when tabs or tags change
  useEffect(() => {
    fetchPosts();
  }, [activeTypeTab, activeSortTab, activeTag]);

  // Search submission helper
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const parsedTags = postTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title,
        content,
        type: postType,
        tags: parsedTags,
        status: isDraft ? 'DRAFT' : 'PUBLISHED'
      };

      let res;
      if (editPostId) {
        res = await apiClient.put(`/forum/${editPostId}`, payload);
      } else {
        res = await apiClient.post('/forum', payload);
      }

      if (res.data.success) {
        showToast(editPostId ? 'Cập nhật bài viết thành công!' : (isDraft ? 'Đã lưu bản nháp thành công!' : 'Đăng bài viết thành công!'));
        setTitle('');
        setContent('');
        setPostTags('');
        setEditPostId(null);
        setIsCreating(false);
        fetchPosts();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Đăng bài thất bại. Vui lòng kiểm tra kết nối.');
    }
  };

  const handleEditInit = (post: ForumPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPostType(post.type);
    setPostTags(post.tags.join(', '));
    setIsDraft(post.status === 'DRAFT');
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setContent(prev => prev + `\n![Hình ảnh](${res.data.url})\n`);
        showToast('Tải ảnh lên thành công và chèn vào nội dung!');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thích bài viết.');
      return;
    }
    
    // Optimistic UI updates
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { 
          ...p, 
          isLiked: !p.isLiked, 
          likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 
        };
      }
      return p;
    }));

    try {
      await apiClient.post(`/forum/${postId}/like`);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleBookmark = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để lưu bài viết.');
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isBookmarked: !p.isBookmarked };
      }
      return p;
    }));

    try {
      const res = await apiClient.post(`/forum/${postId}/bookmark`);
      showToast(res.data.data.bookmarked ? 'Đã lưu bài viết vào Bookmark!' : 'Đã bỏ lưu bài viết.');
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  const handleShare = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/forum#${postId}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Đã sao chép liên kết bài viết vào Clipboard!');
  };

  const handleTogglePin = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiClient.put(`/forum/${postId}/pin`);
      if (res.data.success) {
        showToast('Cập nhật trạng thái ghim bài viết!');
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to pin post:', err);
      alert('Không thể ghim bài viết này.');
    }
  };

  const handleDeleteComment = async (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      const res = await apiClient.delete(`/forum/comments/${commentId}`);
      if (res.data.success) {
        showToast('Đã xóa bình luận thành công!');
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Xóa bình luận thất bại.');
    }
  };

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này vĩnh viễn?')) return;
    try {
      const res = await apiClient.delete(`/forum/${postId}`);
      if (res.data.success) {
        showToast('Đã xóa bài viết thành công!');
        if (expandedPostId === postId) setExpandedPostId(null);
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Xóa bài viết thất bại.');
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const res = await apiClient.post(`/forum/${postId}/comments`, { content: newComment });
      if (res.data.success) {
        setNewComment('');
        showToast('Gửi bình luận thành công!');
        // Refresh detail list
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to send comment:', err);
      alert('Không thể gửi bình luận.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (postId: string, parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const res = await apiClient.post(`/forum/${postId}/comments`, { 
        content: newReplyContent,
        parentId
      });
      if (res.data.success) {
        setNewReplyContent('');
        setReplyToCommentId(null);
        showToast('Phản hồi bình luận thành công!');
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Không thể gửi phản hồi.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenReportModal = (postId: string | null, commentId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để báo cáo nội dung.');
      return;
    }
    setReportPostId(postId);
    setReportCommentId(commentId);
    setReportReason('Spam');
    setCustomReportReason('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reportReason === 'Khác' ? customReportReason : reportReason;
    if (!finalReason.trim()) {
      alert('Vui lòng cung cấp lý do báo cáo');
      return;
    }

    try {
      if (reportPostId) {
        await apiClient.post(`/forum/${reportPostId}/report`, { reason: finalReason });
        showToast('Đã gửi báo cáo bài viết. Ban quản trị sẽ sớm xem xét.');
      } else if (reportCommentId) {
        await apiClient.post(`/forum/comments/${reportCommentId}/report`, { reason: finalReason });
        showToast('Đã gửi báo cáo bình luận. Ban quản trị sẽ sớm xem xét.');
      }
      setShowReportModal(false);
    } catch (err) {
      console.error('Failed to send report:', err);
      alert('Gửi báo cáo thất bại.');
    }
  };

  // Helper formatting for markdown syntax shortcuts
  const insertMarkdownHelper = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;

    setContent(text.substring(0, start) + replacement + text.substring(end));
    
    // Focus back
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const toggleExpand = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // Filter display list based on post types
  const getTabLabel = (type: string) => {
    switch (type) {
      case 'ALL': return 'Tất cả';
      case 'ANNOUNCEMENT': return 'Thông báo';
      case 'NEWS': return 'Bản tin';
      case 'FARM_STORY': return 'Nhật ký HTX';
      case 'TIP': return 'Mẹo làm vườn';
      case 'POST': return 'Hỏi đáp';
      case 'RECIPE': return 'Món ngon';
      case 'BOOKMARKS': return 'Bài đã lưu';
      default: return type;
    }
  };

  // Popular system tags
  const trendingTagsList = [
    'VietGAP', 'Hữu cơ', 'Số hóa', 'Ủ phân', 'Compost', 'Cái Mơn', 
    'Bưởi da xanh', 'Cà chua bi', 'Nhật ký vụ mùa', 'Hỏi đáp'
  ];

  return (
    <Container className="py-8 space-y-6 max-w-7xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-55 animate-in fade-in slide-in-from-bottom-5 font-semibold text-sm border border-slate-800">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner / Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-emerald-950 to-teal-950 p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/30">
        <div className="space-y-3 max-w-2xl">
          <Badge className="bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            CropNet Social Commerce Hub
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
            Cộng Đồng Nông Nghiệp Sạch
          </h1>
          <p className="text-emerald-50/90 text-sm md:text-base leading-relaxed">
            Kết nối nhà nông Kể câu chuyện vườn rừng và Người tiêu dùng chia sẻ mẹo vặt, công thức nấu ăn sạch tự nhiên.
          </p>
        </div>

        <div>
          {isAuthenticated ? (
            <Button 
              onClick={() => {
                setEditPostId(null);
                setIsCreating(!isCreating);
                if (!isCreating) {
                  setTitle('');
                  setContent('');
                  setPostTags('');
                }
              }} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg border border-emerald-400/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{isCreating ? 'Hủy viết bài' : 'Đăng bài chia sẻ'}</span>
            </Button>
          ) : (
            <div className="bg-emerald-950/50 backdrop-blur-md border border-emerald-700/30 p-4 rounded-2xl max-w-xs text-xs text-emerald-200">
              <span className="font-bold text-white block mb-1">✍️ Muốn tham gia thảo luận?</span>
              Hãy đăng nhập tài khoản CropNet của bạn để đăng bài và tương tác cùng cộng đồng.
            </div>
          )}
        </div>
      </div>

      {/* Post Editor Form */}
      {isCreating && isAuthenticated && (
        <Card className="p-6 md:p-8 border border-emerald-100 bg-white shadow-md rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>{editPostId ? 'Chỉnh sửa bài đăng của bạn' : 'Bắt đầu bài viết mới'}</span>
            </h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPreviewMode(!previewMode)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {previewMode ? 'Chế độ soạn thảo' : 'Xem trước Markdown'}
              </button>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!previewMode ? (
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Tiêu đề bài viết"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề ấn tượng..."
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Chuyên mục đăng</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {/* Filter types based on Roles */}
                    {user?.role === 'ADMIN' && (
                      <>
                        <option value="ANNOUNCEMENT">Thông báo chính thức</option>
                        <option value="NEWS">Bản tin nông nghiệp</option>
                        <option value="TUTORIAL">Hướng dẫn kỹ thuật</option>
                      </>
                    )}
                    {(user?.role === 'FARMER' || user?.role === 'ADMIN') && (
                      <>
                        <option value="FARM_STORY">Nhật ký nông trại (Farm Story)</option>
                        <option value="TIP">Mẹo canh tác / Làm vườn</option>
                        <option value="EDUCATION">Kiến thức nông sản</option>
                        <option value="SUSTAINABILITY">Nông nghiệp bền vững</option>
                      </>
                    )}
                    <option value="POST">Thảo luận / Hỏi đáp cộng đồng</option>
                    <option value="RECIPE">Công thức nấu ăn ngon</option>
                  </select>
                </div>
              </div>

              {/* Markdown Quick formatting bar & Image upload */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-2 rounded-xl border border-gray-150">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                  <button 
                    type="button" 
                    onClick={() => insertMarkdownHelper('**', '**')}
                    className="p-2 hover:bg-gray-250 rounded font-bold hover:text-gray-900"
                    title="In đậm"
                  >
                    B
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdownHelper('*', '*')}
                    className="p-2 hover:bg-gray-250 rounded italic hover:text-gray-900"
                    title="In nghiêng"
                  >
                    I
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdownHelper('# ', '')}
                    className="p-2 hover:bg-gray-250 rounded hover:text-gray-900"
                    title="Tiêu đề lớn"
                  >
                    H1
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdownHelper('## ', '')}
                    className="p-2 hover:bg-gray-250 rounded hover:text-gray-900"
                    title="Tiêu đề vừa"
                  >
                    H2
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdownHelper('- ', '')}
                    className="p-2 hover:bg-gray-250 rounded hover:text-gray-900"
                    title="Gạch đầu dòng"
                  >
                    • Danh sách
                  </button>
                  <span className="h-4 w-px bg-gray-300 mx-1"></span>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdownHelper('[Tên liên kết](', ')') }
                    className="p-2 hover:bg-gray-250 rounded hover:text-gray-900"
                    title="Chèn link"
                  >
                    Link
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-white hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold transition-colors flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{uploadingImage ? 'Đang tải ảnh...' : 'Chèn ảnh minh họa'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nội dung chi tiết (Hỗ trợ định dạng Markdown)</label>
                <textarea
                  id="post-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Kể câu chuyện nông trại của bạn, chia sẻ công thức nấu ăn hoặc câu hỏi thắc mắc..."
                  rows={8}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                ></textarea>
              </div>

              <Input
                label="Tags / Thẻ gắn (Phân cách bằng dấu phẩy)"
                value={postTags}
                onChange={(e) => setPostTags(e.target.value)}
                placeholder="Ví dụ: VietGAP, huuco, rauchu, caitaodat"
              />

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Trạng thái lưu:</span>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsDraft(false)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                        !isDraft ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Xuất bản ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDraft(true)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                        isDraft ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Bản nháp
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    variant="secondary"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 focus:ring-emerald-500 text-white font-extrabold px-6"
                  >
                    {editPostId ? 'Cập nhật bài viết' : (isDraft ? 'Lưu bản nháp' : 'Xuất bản bài viết')}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Markdown Preview area */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 min-h-[300px] space-y-4">
                <h2 className="text-2xl font-black text-gray-900 border-b border-gray-200 pb-2">{title || 'Tiêu đề bài viết'}</h2>
                <div className="text-xs text-gray-400 font-bold flex gap-4">
                  <span>Chuyên mục: {getTabLabel(postType)}</span>
                  <span>Tags: {postTags || 'Chưa gắn tag'}</span>
                </div>
                <div className="prose max-w-none text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {content || 'Chưa viết nội dung thảo luận...'}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Navigation Tabs, Sorters, Filters */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tabs Filter Category */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
            {[
              'ALL', 'ANNOUNCEMENT', 'NEWS', 'FARM_STORY', 'POST', 'RECIPE', 'BOOKMARKS'
            ].map(tab => {
              if (tab === 'BOOKMARKS' && !isAuthenticated) return null;
              
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTypeTab(tab);
                    setActiveTag(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    activeTypeTab === tab 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-150 hover:bg-gray-50'
                  }`}
                >
                  {getTabLabel(tab)}
                </button>
              );
            })}
          </div>

          {/* Sorter and Search Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 w-full sm:w-auto">
              {[
                { id: 'newest', label: 'Mới nhất' },
                { id: 'trending', label: 'Nổi bật' },
                { id: 'popular', label: 'Lượt thích' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSortTab(s.id)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeSortTab === s.id 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Custom Tag indicator if filtering by tag */}
            {activeTag && (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                <span>Tag: #{activeTag}</span>
                <button onClick={() => setActiveTag(null)} className="hover:text-emerald-950 font-black">×</button>
              </Badge>
            )}

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Tìm tiêu đề, bài đăng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </form>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <Card key={n} className="animate-pulse space-y-4 p-6 border border-gray-100">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-gray-150 rounded-full"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-gray-150 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-150 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-150 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-150 rounded w-full"></div>
                  <div className="h-4 bg-gray-150 rounded w-2/3"></div>
                  <div className="border-t border-gray-100 pt-4 flex gap-4">
                    <div className="h-4 bg-gray-150 rounded w-12"></div>
                    <div className="h-4 bg-gray-150 rounded w-20"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 border border-red-100 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="font-bold">{error}</p>
              <Button onClick={fetchPosts} variant="outline" className="bg-white border-red-200">Thử lại</Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-400 space-y-4">
              <MessageSquare className="w-14 h-14 mx-auto text-gray-300" />
              <div>
                <p className="font-black text-xl text-gray-900">Không có bài viết thảo luận nào</p>
                <p className="text-sm mt-1">Hãy khơi nguồn chia sẻ bài đăng nông sản sạch đầu tiên!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => {
                const isExpanded = expandedPostId === post.id;
                const canEditDelete = user && (user.role === 'ADMIN' || user.id === post.authorId);
                const isAdmin = user && user.role === 'ADMIN';

                return (
                  <Card 
                    key={post.id} 
                    id={post.id}
                    className={`hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border bg-white ${
                      post.isPinned ? 'border-amber-200 bg-amber-50/5' : 'border-gray-100'
                    } ${post.status === 'DRAFT' ? 'border-dashed border-gray-300 bg-gray-50/20' : ''}`}
                    onClick={() => toggleExpand(post.id)}
                  >
                    <div className="p-6 space-y-4">
                      
                      {/* Post Header Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            post.type === 'ANNOUNCEMENT' ? 'error' :
                            post.type === 'NEWS' ? 'info' :
                            post.type === 'FARM_STORY' ? 'success' :
                            post.type === 'RECIPE' ? 'purple' : 'secondary'
                          }>
                            {getTabLabel(post.type)}
                          </Badge>

                          {post.status === 'DRAFT' && (
                            <Badge className="bg-gray-100 text-gray-500 border border-gray-250 font-bold">BẢN NHÁP</Badge>
                          )}

                          {post.isPinned && (
                            <span className="flex items-center gap-1 text-amber-700 font-bold">
                              <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>Ghim đầu trang</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-400 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      {/* Author Card Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-black shadow-inner">
                          {post.authorName[0]?.toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-extrabold text-sm">{post.authorName}</span>
                            <Badge variant="secondary" className="text-[10px] py-0.5 px-1.5">
                              {post.authorRole === 'FARMER' || post.authorRole === 'SUPPLIER' ? '👨‍🌾 HỘ SẢN XUẤT' :
                               post.authorRole === 'INSPECTOR' ? '🔍 KIỂM ĐỊNH' :
                               post.authorRole === 'LOGISTICS' ? '🚚 VẬN CHUYỂN' : 
                               post.authorRole === 'ADMIN' ? '🛡️ QUẢN TRỊ' : 'MEMBER'}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wider">{post.viewsCount} lượt xem</span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        <h3 className="font-extrabold text-lg md:text-xl text-gray-900 hover:text-emerald-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {post.content}
                        </p>
                      </div>

                      {/* Post Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                          {post.tags.map(t => (
                            <button
                              key={t}
                              onClick={() => setActiveTag(t)}
                              className="text-[11px] font-bold bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-1 transition-colors"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Social Controls Interaction Panel */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-5 text-gray-500 text-xs font-extrabold">
                          <button
                            onClick={(e) => handleLike(post.id, e)}
                            className={`flex items-center gap-1.5 transition-colors group ${
                              post.isLiked ? 'text-red-500' : 'hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                              post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                            }`} />
                            <span>{post.likes}</span>
                          </button>

                          <div className="flex items-center gap-1.5 hover:text-emerald-600">
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                            <span>{post.commentsCount} bình luận</span>
                          </div>

                          <button
                            onClick={(e) => handleBookmark(post.id, e)}
                            className={`flex items-center gap-1.5 transition-colors group ${
                              post.isBookmarked ? 'text-emerald-600' : 'hover:text-emerald-600'
                            }`}
                          >
                            <Bookmark className={`w-5 h-5 ${
                              post.isBookmarked ? 'fill-emerald-600 text-emerald-600' : 'text-gray-400'
                            }`} />
                            <span>{post.isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
                          </button>

                          <button
                            onClick={(e) => handleShare(post.id, e)}
                            className="flex items-center gap-1.5 hover:text-emerald-600 text-gray-400 font-extrabold"
                          >
                            <Share2 className="w-5 h-5" />
                            <span>Chia sẻ</span>
                          </button>
                        </div>

                        {/* Mod & Edit Panel */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {canEditDelete && (
                            <button
                              onClick={(e) => handleEditInit(post, e)}
                              className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-xl border border-gray-150 transition-colors"
                              title="Chỉnh sửa bài"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={(e) => handleTogglePin(post.id, e)}
                              className={`p-2 rounded-xl border transition-colors ${
                                post.isPinned 
                                  ? 'bg-amber-100 border-amber-200 text-amber-700' 
                                  : 'border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                              }`}
                              title={post.isPinned ? 'Bỏ ghim bài' : 'Ghim bài đăng'}
                            >
                              <Pin className="w-4 h-4" />
                            </button>
                          )}

                          {canEditDelete && (
                            <button
                              onClick={(e) => handleDelete(post.id, e)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-xl border border-red-100 transition-colors"
                              title="Xóa bài"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {isAuthenticated && post.authorId !== user?.id && (
                            <button
                              onClick={(e) => handleOpenReportModal(post.id, null, e)}
                              className="p-2 hover:bg-amber-50 text-amber-600 rounded-xl border border-amber-100 transition-colors"
                              title="Báo cáo vi phạm"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          )}

                          <div className="text-gray-400 p-2">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Extended Section (Nested Comments) */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-100 p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <span>Ý kiến trao đổi ({post.comments?.length || 0})</span>
                          </h4>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                          {!post.comments || post.comments.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Chưa có ý kiến thảo luận nào. Hãy chia sẻ quan điểm của bạn đầu tiên!</p>
                          ) : (
                            post.comments.map(comment => (
                              <div key={comment.id} className="space-y-3">
                                {/* Parent Comment Card */}
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2 relative group/comment">
                                  <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-gray-900">{comment.authorName}</span>
                                      {comment.authorId === post.authorId && (
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] py-0 px-1">Tác giả</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                      <span>{formatDate(comment.createdAt)}</span>
                                      
                                      {/* Report Comment */}
                                      {isAuthenticated && comment.authorId !== user?.id && (
                                        <button 
                                          onClick={(e) => handleOpenReportModal(null, comment.id, e)}
                                          className="text-gray-300 hover:text-amber-600 transition-colors"
                                          title="Báo cáo bình luận"
                                        >
                                          <Flag className="w-3 h-3" />
                                        </button>
                                      )}

                                      {/* Delete Comment */}
                                      {isAuthenticated && (user?.role === 'ADMIN' || comment.authorId === user?.id) && (
                                        <button 
                                          onClick={(e) => handleDeleteComment(comment.id, e)}
                                          className="text-gray-300 hover:text-red-500 transition-colors"
                                          title="Xóa bình luận"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                  
                                  {/* Interaction: Reply Trigger */}
                                  {isAuthenticated && (
                                    <div className="flex justify-end pt-1">
                                      <button 
                                        onClick={() => {
                                          setReplyToCommentId(replyToCommentId === comment.id ? null : comment.id);
                                          setNewReplyContent('');
                                        }}
                                        className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                      >
                                        <CornerDownRight className="w-3.5 h-3.5" />
                                        <span>{replyToCommentId === comment.id ? 'Hủy phản hồi' : 'Trả lời'}</span>
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Replies Thread Rendering */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="ml-8 border-l-2 border-emerald-100 pl-4 space-y-3">
                                    {comment.replies.map(reply => (
                                      <div key={reply.id} className="bg-white/80 p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-1.5 relative">
                                        <div className="flex justify-between items-center text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-gray-900">{reply.authorName}</span>
                                            {reply.authorId === post.authorId && (
                                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] py-0 px-1">Tác giả</Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3 text-gray-400">
                                            <span>{formatDate(reply.createdAt)}</span>
                                            
                                            {isAuthenticated && reply.authorId !== user?.id && (
                                              <button 
                                                onClick={(e) => handleOpenReportModal(null, reply.id, e)}
                                                className="text-gray-300 hover:text-amber-600 transition-colors"
                                                title="Báo cáo phản hồi"
                                              >
                                                <Flag className="w-3 h-3" />
                                              </button>
                                            )}

                                            {/* Delete Reply */}
                                            {isAuthenticated && (user?.role === 'ADMIN' || reply.authorId === user?.id) && (
                                              <button 
                                                onClick={(e) => handleDeleteComment(reply.id, e)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                title="Xóa phản hồi"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Reply Input Form */}
                                {replyToCommentId === comment.id && isAuthenticated && (
                                  <form onSubmit={(e) => handleAddReply(post.id, comment.id, e)} className="ml-8 space-y-2 animate-in fade-in duration-200">
                                    <textarea
                                      value={newReplyContent}
                                      onChange={(e) => setNewReplyContent(e.target.value)}
                                      placeholder={`Phản hồi bình luận của ${comment.authorName}...`}
                                      rows={2}
                                      className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      required
                                    ></textarea>
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        type="button" 
                                        onClick={() => setReplyToCommentId(null)}
                                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold"
                                      >
                                        Hủy
                                      </button>
                                      <button 
                                        type="submit" 
                                        disabled={submittingComment}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs"
                                      >
                                        Gửi phản hồi
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Top-level Comment Form */}
                        {isAuthenticated ? (
                          <form onSubmit={(e) => handleAddComment(post.id, e)} className="space-y-3 pt-2">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Viết bình luận hoặc ý kiến đóng góp của bạn..."
                              rows={3}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              required
                            ></textarea>
                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                disabled={submittingComment}
                                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-extrabold px-5"
                              >
                                {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-center text-xs text-gray-500 font-semibold">
                            Vui lòng đăng nhập tài khoản để gửi bình luận.
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Info Panel, Tags and Featured Farm Profiles */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick info community rules */}
          <Card className="p-5 border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 space-y-4">
            <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
              <span>📌 Nội quy diễn đàn</span>
            </h4>
            <ul className="text-xs text-gray-650 space-y-2.5 leading-relaxed font-semibold">
              <li className="flex gap-2">
                <span className="text-emerald-600">✔</span>
                <span>Chỉ đăng bài viết thực tế có liên quan đến nông sản, dinh dưỡng sạch.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✔</span>
                <span>Tôn trọng ý kiến đóng góp kỹ thuật canh tác của các hợp tác xã vùng sâu.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✔</span>
                <span>Không đăng quảng cáo rác, ngôn từ không lành mạnh.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">✘</span>
                <span>Mọi hành vi gian lận thông tin xuất xứ sẽ bị chặn tài khoản ngay lập tức.</span>
              </li>
            </ul>
          </Card>

          {/* Trending Tags list */}
          <Card className="p-5 border border-gray-100 space-y-4 bg-white shadow-xs">
            <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Trending Tags</span>
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {trendingTagsList.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveTag(tag);
                    setActiveTypeTab('ALL');
                  }}
                  className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-all ${
                    activeTag === tag
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-inner'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </Card>

          {/* Featured Farms Profiles */}
          <Card className="p-5 border border-gray-100 space-y-4 bg-white shadow-xs">
            <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Nhà Vườn Nổi Bật</span>
            </h4>
            <div className="space-y-3.5 pt-1">
              {[
                { name: 'HTX Cái Mơn', address: 'Bến Tre', items: 'Bưởi Da Xanh', desc: 'Canh tác đạt chuẩn hữu cơ sinh học sông Hàm Luông.' },
                { name: 'Vườn Rau Sạch Bến Tre', address: 'Bến Tre', items: 'Rau Muống, Cải ngọt', desc: 'Mô hình phân lân vi sinh an toàn không hóa chất.' }
              ].map((farm, i) => (
                <div key={i} className="space-y-1 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <p className="font-extrabold text-sm text-gray-900 hover:text-emerald-600 cursor-pointer">{farm.name}</p>
                  <div className="flex gap-2 text-[10px] text-gray-400 font-bold uppercase">
                    <span>{farm.address}</span>
                    <span>•</span>
                    <span className="text-emerald-700">{farm.items}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal">{farm.desc}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* Report Violation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-1.5">
                <Flag className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Báo cáo vi phạm nội dung</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Lý do báo cáo</label>
                <div className="space-y-2.5">
                  {[
                    'Spam / Quảng cáo không đúng chuyên mục',
                    'Ngôn từ thiếu văn hóa / Công kích cá nhân',
                    'Nông sản giả mạo / Chất lượng sai lệch thực tế',
                    'Khác'
                  ].map(reason => (
                    <label key={reason} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason || (reason === 'Khác' && reportReason === 'Khác')}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 border-gray-300"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {reportReason === 'Khác' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Chi tiết lý do khác</label>
                  <textarea
                    value={customReportReason}
                    onChange={(e) => setCustomReportReason(e.target.value)}
                    placeholder="Vui lòng cung cấp thêm thông tin để ban quản trị xử lý nhanh..."
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  variant="secondary"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-white font-extrabold px-6"
                >
                  Gửi báo cáo
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Container>
  );
}
