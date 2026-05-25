'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Input, ConfirmDialog, Skeleton } from '@cropnet/ui';
import {
  ShieldCheck, UserMinus, UserPlus, Users, ShoppingBag, Clock, 
  Search, ShieldAlert, FileText, CheckCircle2, XCircle, Trash2, 
  Layers, PackageCheck, Eye, EyeOff, DollarSign, Pin, MessageSquare, 
  PlusCircle, ThumbsUp, Edit3
} from 'lucide-react';
import RouteGuard from '@/shared/components/RouteGuard';
import { apiClient } from '@/shared/services/api';
import { formatVND, formatDate } from '@cropnet/utils';
import { RevenueAreaChart, GrowthLineChart } from '@/shared/components/QuickCharts';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'orders' | 'certificates' | 'forum' | 'categories'>('overview');
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  const triggerConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: () => {
        options.onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      variant: options.variant || 'primary'
    });
  };

  // States for data collections
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [moderationSubTab, setModerationSubTab] = useState<'reports' | 'posts'>('reports');
  const [viewCertUrl, setViewCertUrl] = useState<string | null>(null);

  // Dashboard Analytics States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '12m'>('7d');

  // Form states for Category Management
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  // Form states for official admin posting
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'ANNOUNCEMENT' | 'NEWS' | 'TUTORIAL'>('ANNOUNCEMENT');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('ALL');
  const [isDisputeResolveLoading, setIsDisputeResolveLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes, ordersRes, certsRes, forumRes, catsRes, reportsRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/products'),
        apiClient.get('/admin/orders'),
        apiClient.get('/admin/certificates'),
        apiClient.get('/forum?status=ALL'), // Admin gets all posts including hidden/drafts
        apiClient.get('/categories'),
        apiClient.get('/forum/admin/reports')
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (productsRes.data.success) setProducts(productsRes.data.data);
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (certsRes.data.success) setCertificates(certsRes.data.data);
      if (forumRes.data.success) setForumPosts(forumRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
    } catch (err) {
      console.warn('Failed to load administrative details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (range: '7d' | '30d' | '12m') => {
    try {
      let days = 7;
      if (range === '30d') days = 30;
      else if (range === '12m') days = 365;
      const startDate = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const res = await apiClient.get('/analytics/dashboard', { params: { startDate } });
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load dashboard statistics:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDashboardData(dateRange);
  }, [dateRange]);

  const handleExportCSV = async () => {
    try {
      let days = 7;
      if (dateRange === '30d') days = 30;
      else if (dateRange === '12m') days = 365;
      const startDate = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const response = await apiClient.get('/analytics/export', {
        params: { startDate },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cropnet-admin-report-${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Không thể xuất báo cáo CSV');
    }
  };

  // --- User Moderation ---
  const handleApprove = async (id: string) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/approve`);
      if (res.data.success) {
        alert(res.data.message || 'Đã phê duyệt tài khoản thành công!');
        fetchData();
      }
    } catch (err) {
      alert('Phê duyệt thất bại.');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/block`);
      if (res.data.success) {
        alert(res.data.message || 'Đã khóa tài khoản thành công!');
        fetchData();
      }
    } catch (err) {
      alert('Thao tác thất bại.');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      const res = await apiClient.put(`/admin/users/${id}/unblock`);
      if (res.data.success) {
        alert(res.data.message || 'Đã kích hoạt lại tài khoản thành công!');
        fetchData();
      }
    } catch (err) {
      alert('Thao tác thất bại.');
    }
  };

  // --- Product Vetting ---
  const handleToggleProductStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await apiClient.put(`/admin/products/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        alert(res.data.message || 'Cập nhật trạng thái sản phẩm thành công!');
        fetchData();
      }
    } catch (err) {
      alert('Thao tác thất bại.');
    }
  };

  const handleDeleteProduct = (id: string) => {
    triggerConfirm({
      title: 'Xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn khỏi sàn?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiClient.delete(`/admin/products/${id}`);
          if (res.data.success) {
            alert(res.data.message || 'Đã xóa sản phẩm thành công!');
            fetchData();
          }
        } catch (err) {
          alert('Xóa sản phẩm thất bại.');
        }
      }
    });
  };

  // --- Certificate Verification ---
  const handleApproveCert = async (id: string) => {
    try {
      const res = await apiClient.put(`/admin/certificates/${id}/approve`);
      if (res.data.success) {
        alert(res.data.message || 'Đã phê duyệt chứng nhận chất lượng!');
        fetchData();
      }
    } catch (err) {
      alert('Phê duyệt thất bại.');
    }
  };

  const handleRejectCert = async (id: string) => {
    try {
      const res = await apiClient.put(`/admin/certificates/${id}/reject`);
      if (res.data.success) {
        alert(res.data.message || 'Đã từ chối chứng nhận chất lượng!');
        fetchData();
      }
    } catch (err) {
      alert('Thao tác từ chối thất bại.');
    }
  };

  // --- Order Cancellation / Refund ---
  const handleCancelOrder = (id: string) => {
    triggerConfirm({
      title: 'Hủy đơn hàng',
      message: 'Hành động này sẽ hủy và hoàn tiền (nếu có) đơn hàng này. Tiếp tục?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiClient.put(`/admin/orders/${id}/cancel`);
          if (res.data.success) {
            alert(res.data.message || 'Đã hủy đơn hàng thành công!');
            fetchData();
          }
        } catch (err) {
          alert('Hủy đơn hàng thất bại.');
        }
      }
    });
  };

  const handleResolveDispute = (id: string, resolution: 'REFUNDED' | 'DELIVERED') => {
    const msg = resolution === 'REFUNDED' 
      ? 'Bạn có chắc chắn muốn CHẤP NHẬN khiếu nại và HOÀN TIỀN cho đơn hàng này? Tồn kho sản phẩm tương ứng sẽ được cộng lại và ví thanh toán sẽ cập nhật.'
      : 'Bạn có chắc chắn muốn TỪ CHỐI khiếu nại này? Đơn hàng sẽ trở lại trạng thái Đã giao thành công.';
    
    triggerConfirm({
      title: resolution === 'REFUNDED' ? 'Chấp nhận khiếu nại' : 'Từ chối khiếu nại',
      message: msg,
      variant: resolution === 'REFUNDED' ? 'danger' : 'primary',
      onConfirm: async () => {
        setIsDisputeResolveLoading(id);
        try {
          const res = await apiClient.post(`/orders/${id}/dispute/resolve`, { resolution });
          if (res.data.success) {
            alert('Đã xử lý tranh chấp khiếu nại thành công!');
            fetchData();
          }
        } catch (err: any) {
          console.warn(err);
          alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Có lỗi xảy ra khi xử lý khiếu nại');
        } finally {
          setIsDisputeResolveLoading(null);
        }
      }
    });
  };

  // --- Forum / Community Moderation ---
  const handleTogglePinPost = async (id: string) => {
    try {
      const res = await apiClient.put(`/forum/${id}/pin`);
      if (res.data.success) {
        alert(res.data.message || 'Cập nhật trạng thái ghim thành công!');
        fetchData();
      }
    } catch (err) {
      alert('Thao tác ghim thất bại.');
    }
  };

  const handleResolveReport = (reportId: string, action: 'DISMISS' | 'HIDE' | 'DELETE') => {
    const confirmationMsg = action === 'DISMISS' 
      ? 'Bạn có chắc chắn muốn bỏ qua báo cáo này?'
      : action === 'HIDE' 
        ? 'Bạn có chắc chắn muốn ẩn nội dung bị báo cáo này khỏi diễn đàn?'
        : 'Bạn có chắc chắn muốn xóa vĩnh viễn nội dung này khỏi hệ thống?';

    triggerConfirm({
      title: 'Giải quyết báo cáo vi phạm',
      message: confirmationMsg,
      variant: action === 'DELETE' ? 'danger' : action === 'HIDE' ? 'warning' : 'primary',
      onConfirm: async () => {
        try {
          const res = await apiClient.put(`/forum/admin/reports/${reportId}/resolve`, { action });
          if (res.data.success) {
            alert('Đã giải quyết báo cáo kiểm duyệt thành công!');
            fetchData();
          }
        } catch (err: any) {
          alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Thao tác giải quyết báo cáo thất bại.');
        }
      }
    });
  };

  const handleWarnUser = (userId: string, authorName: string) => {
    alert(`Đã gửi cảnh cáo vi phạm quy chế cộng đồng CropNet đến thành viên ${authorName} (ID: ${userId})`);
  };

  const handleDeletePost = (id: string) => {
    triggerConfirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này khỏi diễn đàn?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiClient.delete(`/forum/${id}`);
          if (res.data.success) {
            alert(res.data.message || 'Xóa bài viết thành công!');
            fetchData();
          }
        } catch (err) {
          alert('Xóa bài viết thất bại.');
        }
      }
    });
  };

  const handleEditPostInit = (post: any) => {
    setEditPostId(post.id);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    const adminTypes = ['ANNOUNCEMENT', 'NEWS', 'TUTORIAL'];
    if (adminTypes.includes(post.type)) {
      setNewPostType(post.type as any);
    } else {
      setNewPostType('ANNOUNCEMENT');
    }
    setIsCreatingPost(true);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }
    try {
      let res;
      if (editPostId) {
        res = await apiClient.put(`/forum/${editPostId}`, {
          title: newPostTitle,
          content: newPostContent,
          type: newPostType
        });
      } else {
        res = await apiClient.post('/forum', {
          title: newPostTitle,
          content: newPostContent,
          type: newPostType
        });
      }
      
      if (res.data.success) {
        alert(editPostId ? 'Cập nhật bài viết thành công!' : 'Đăng thông báo chính thức thành công!');
        setNewPostTitle('');
        setNewPostContent('');
        setEditPostId(null);
        setIsCreatingPost(false);
        fetchData();
      }
    } catch (err) {
      alert(editPostId ? 'Cập nhật bài viết thất bại.' : 'Đăng bài thất bại.');
    }
  };

  // --- Category CRUD Handlers ---
  const openCreateCategoryModal = () => {
    setEditCategoryId(null);
    setCategoryName('');
    setCategorySlug('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: any) => {
    setEditCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: categoryName, slug: categorySlug };
      if (editCategoryId) {
        const res = await apiClient.put(`/categories/${editCategoryId}`, payload);
        if (res.data.success) {
          alert('Cập nhật danh mục thành công!');
          setIsCategoryModalOpen(false);
          fetchData();
        }
      } else {
        const res = await apiClient.post('/categories', payload);
        if (res.data.success) {
          alert('Tạo danh mục mới thành công!');
          setIsCategoryModalOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Lưu danh mục thất bại');
    }
  };

  const handleDeleteCategory = (id: string) => {
    triggerConfirm({
      title: 'Xóa danh mục',
      message: 'Bạn có chắc chắn muốn xóa danh mục này?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiClient.delete(`/categories/${id}`);
          if (res.data.success) {
            alert('Xóa danh mục thành công!');
            fetchData();
          }
        } catch (err: any) {
          alert('Xóa danh mục thất bại.');
        }
      }
    });
  };

  // --- Computations ---
  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED' || o.payment?.paymentStatus === 'PAID' || o.payment?.paymentStatus === 'SUCCESS')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const pendingApprovals = users.filter(u => 
    (u.role === 'FARMER' && u.supplier?.status === 'PENDING') ||
    (u.role === 'LOGISTICS' && u.status === 'PENDING') ||
    (u.role === 'INSPECTOR' && u.status === 'PENDING')
  ).length;

  const totalOrdersCount = orders.length;

  // Filters
  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supplier?.farmName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.receiverName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterOrderStatus === 'ALL' ||
      o.status === filterOrderStatus;
      
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <RouteGuard allowedRoles={['ADMIN']}>
        <Container className="py-12 space-y-8">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
          </div>
          <Card className="p-6 space-y-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </Card>
        </Container>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <Container className="py-12 space-y-8 max-w-7xl">
        {/* Banner Control Center */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">CropNet Control Center</h2>
            <p className="text-gray-400 text-sm">Hệ thống quản trị và kiểm duyệt tối cao của Sàn Nông Sản Việt Nam</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-2xl text-sm font-bold border border-purple-100">
            <ShieldCheck className="w-5 h-5" />
            <span>Super Administrator Mode</span>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng thành viên</p>
              <h4 className="text-2xl font-black text-gray-955 mt-0.5">{dashboardData?.overview?.totalUsers ?? users.length}</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow border-l-4 border-amber-500">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Yêu cầu chờ duyệt</p>
              <h4 className="text-2xl font-black text-gray-955 mt-0.5">{pendingApprovals}</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Doanh thu sàn</p>
              <h4 className="text-2xl font-black text-gray-955 mt-0.5">
                {formatVND(dashboardData?.overview?.totalRevenue ?? totalRevenue)}
              </h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng số đơn hàng</p>
              <h4 className="text-2xl font-black text-gray-955 mt-0.5">{dashboardData?.overview?.totalOrders ?? totalOrdersCount}</h4>
            </div>
          </Card>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex gap-4 border-b border-gray-100 overflow-x-auto pb-px text-sm font-bold text-gray-400">
          {[
            { id: 'overview', label: 'Hệ thống', icon: Layers },
            { id: 'users', label: 'Thành viên', icon: Users },
            { id: 'products', label: 'Sản phẩm', icon: PackageCheck },
            { id: 'categories', label: 'Danh mục', icon: Layers },
            { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
            { id: 'certificates', label: 'Chứng nhận', icon: FileText },
            { id: 'forum', label: 'Diễn đàn', icon: MessageSquare }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setSearchQuery('');
                }}
                className={`pb-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === t.id ? 'border-purple-600 text-purple-600' : 'border-transparent hover:text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. TAB OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Filter & Export control bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-150">
              <div className="flex gap-2">
                {(['7d', '30d', '12m'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      dateRange === range 
                        ? 'bg-purple-600 text-white shadow-sm border-none' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {range === '7d' ? '7 ngày qua' : range === '30d' ? '30 ngày qua' : '12 tháng qua'}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-purple-650" />
                <span>Xuất báo cáo CSV</span>
              </Button>
            </div>

            {/* Premium Charts side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RevenueAreaChart 
                data={dashboardData?.revenueSeries || []} 
                title={`Doanh Thu Sàn (${dateRange === '7d' ? '7 ngày' : dateRange === '30d' ? '30 ngày' : '12 tháng'})`} 
              />
              <GrowthLineChart data={dashboardData?.userGrowth || []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Eco Distribution */}
              <Card className="lg:col-span-2 p-6 space-y-6">
                <h3 className="font-extrabold text-lg text-gray-955 border-b border-gray-100 pb-4">Phân bổ hệ sinh thái</h3>
                <div className="space-y-4 pt-2">
                  {[
                    { label: 'Người tiêu dùng (Customers)', count: users.filter(u => u.role === 'CUSTOMER').length, color: 'bg-green-500', max: users.length },
                    { label: 'Hợp tác xã/Nông dân (Farmers)', count: users.filter(u => u.role === 'FARMER').length, color: 'bg-amber-500', max: users.length },
                    { label: 'Đối tác logistics (Shippers)', count: users.filter(u => u.role === 'LOGISTICS').length, color: 'bg-blue-500', max: users.length },
                    { label: 'Kiểm định chất lượng (Inspectors)', count: users.filter(u => u.role === 'INSPECTOR').length, color: 'bg-cyan-500', max: users.length }
                  ].map((r, idx) => {
                    const percent = r.max > 0 ? (r.count / r.max) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                          <span>{r.label}</span>
                          <span className="text-gray-955 font-bold">{r.count} ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className={`${r.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Warnings / Alerts Panel */}
              <Card className="p-6 space-y-6">
                <h3 className="font-extrabold text-lg text-gray-955 border-b border-gray-100 pb-4">Cảnh báo hệ thống</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {/* Warning 1: Low stock alerts */}
                  {dashboardData?.alerts?.lowStock && dashboardData.alerts.lowStock.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-red-600 block">⚠️ Hết hàng / Sắp hết hàng (&lt; 15):</span>
                      <div className="space-y-1.5">
                        {dashboardData.alerts.lowStock.map((prod: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-red-50 text-red-700 p-2.5 rounded-lg text-xs font-semibold border border-red-100">
                            <span className="truncate max-w-[150px]">{prod.name}</span>
                            <span>Tồn: {prod.stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning 2: Expiring certs */}
                  {dashboardData?.alerts?.expiringCerts && dashboardData.alerts.expiringCerts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-amber-600 block">⏳ Chứng nhận sắp hết hạn (&lt; 30 ngày):</span>
                      <div className="space-y-1.5">
                        {dashboardData.alerts.expiringCerts.map((cert: any, idx: number) => (
                          <div key={idx} className="flex flex-col bg-amber-50 text-amber-700 p-2.5 rounded-lg text-xs font-semibold border border-amber-100">
                            <span className="font-bold">{cert.title}</span>
                            <span className="text-[10px] text-amber-600 mt-0.5">{cert.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning 3: Pending approvals */}
                  {pendingApprovals > 0 && (
                    <div className="bg-purple-50 text-purple-700 p-3 rounded-xl text-xs font-semibold border border-purple-100 flex items-center justify-between animate-pulse">
                      <span>Có {pendingApprovals} yêu cầu duyệt đối tác</span>
                      <button onClick={() => setActiveTab('users')} className="text-purple-900 underline font-bold hover:text-purple-950">Duyệt ngay</button>
                    </div>
                  )}

                  {/* Empty state */}
                  {(!dashboardData?.alerts?.lowStock || dashboardData.alerts.lowStock.length === 0) &&
                   (!dashboardData?.alerts?.expiringCerts || dashboardData.alerts.expiringCerts.length === 0) &&
                   pendingApprovals === 0 && (
                     <div className="text-center py-6">
                       <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                       <p className="text-xs text-gray-400 font-bold">Hệ thống đang vận hành ổn định, không có cảnh báo.</p>
                     </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 2. TAB USERS */}
        {activeTab === 'users' && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-950">Danh sách tài khoản hệ thống</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tìm kiếm thành viên, thay đổi trạng thái phê duyệt hoặc khóa tài khoản</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm email, họ tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-60"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="py-2.5 px-3 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="CUSTOMER">Người mua (Customer)</option>
                  <option value="FARMER">Nhà vườn (Supplier)</option>
                  <option value="LOGISTICS">Vận chuyển (Logistics)</option>
                  <option value="INSPECTOR">Kiểm định (Inspector)</option>
                </select>
              </div>
            </div>

            <Table headers={['Tên Thành Viên', 'Liên hệ', 'Vai Trò', 'Thông tin nông trại', 'Trạng thái phê duyệt', 'Thao tác']}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Không tìm thấy thành viên phù hợp</td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isFarmerPending = u.role === 'FARMER' && u.supplier?.status === 'PENDING';
                  const isLogisticsPending = u.role === 'LOGISTICS' && u.status === 'PENDING';
                  const isInspectorPending = u.role === 'INSPECTOR' && u.status === 'PENDING';
                  const needsApproval = isFarmerPending || isLogisticsPending || isInspectorPending;

                  return (
                    <tr key={u.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-955">{u.fullName}</td>
                      <td className="py-4 px-4 text-xs">
                        <p className="text-gray-650 font-semibold">{u.email}</p>
                        {u.phone && <p className="text-gray-400 font-mono mt-0.5">{u.phone}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={
                          u.role === 'ADMIN' ? 'purple' :
                          u.role === 'CUSTOMER' ? 'success' : 'warning'
                        }>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        {u.role === 'FARMER' && u.supplier ? (
                          <div>
                            <p className="font-bold text-gray-800">{u.supplier.farmName}</p>
                            <p className="text-gray-400 mt-0.5">{u.supplier.address}</p>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {needsApproval ? (
                          <Badge variant="warning">Chờ phê duyệt</Badge>
                        ) : (
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>
                            {u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {needsApproval && (
                            <Button
                              onClick={() => handleApprove(u.id)}
                              variant="primary"
                              className="px-2.5 py-1 text-xs"
                              icon={<ShieldCheck className="w-3.5 h-3.5" />}
                            >
                              Duyệt
                            </Button>
                          )}
                          {u.role !== 'ADMIN' && (
                            u.status === 'ACTIVE' ? (
                              <Button
                                onClick={() => handleBlock(u.id)}
                                variant="danger"
                                className="px-2.5 py-1 text-xs"
                                icon={<UserMinus className="w-3.5 h-3.5" />}
                              >
                                Khóa
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleUnblock(u.id)}
                                variant="secondary"
                                className="px-2.5 py-1 text-xs text-emerald-600 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100"
                                icon={<UserPlus className="w-3.5 h-3.5" />}
                              >
                                Mở khóa
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </Table>
          </Card>
        )}

        {/* 3. TAB PRODUCTS */}
        {activeTab === 'products' && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-950">Quản lý nông sản kiểm duyệt</h3>
                <p className="text-xs text-gray-400 mt-0.5">Ẩn, hiện sản phẩm hoặc xóa sản phẩm vi phạm bản quyền/chất lượng</p>
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm, nhà vườn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-60"
                />
              </div>
            </div>

            <Table headers={['Sản Phẩm', 'Nhà vườn/Supplier', 'Đơn giá', 'Tồn kho', 'Trạng thái duyệt', 'Hành động']}>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Chưa có sản phẩm nào đăng bán</td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-955 flex items-center gap-3">
                      <img 
                        src={p.images?.[0]?.url || p.imageUrl || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=150&auto=format'} 
                        alt={p.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100" 
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-gray-655">{p.supplier?.farmName || 'HTX Cái Mơn'}</td>
                    <td className="py-4 px-4 text-gray-800 font-bold">{formatVND(Number(p.price))}</td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">{p.stock} {p.unit}</td>
                    <td className="py-4 px-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {p.status === 'ACTIVE' ? 'Đang hiển thị' : 'Đang ẩn'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleToggleProductStatus(p.id, p.status)}
                          variant="outline"
                          className="px-2.5 py-1 text-xs"
                          icon={p.status === 'ACTIVE' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        >
                          {p.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(p.id)}
                          variant="danger"
                          className="px-2.5 py-1 text-xs"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        )}

        {/* 4. TAB ORDERS */}
        {activeTab === 'orders' && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-950">Can thiệp đơn hàng & Xử lý khiếu nại</h3>
                <p className="text-xs text-gray-400 mt-0.5">Theo dõi hành trình đơn hàng toàn sàn, hủy đơn hoặc giải quyết tranh chấp</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterOrderStatus}
                  onChange={(e) => setFilterOrderStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-505 bg-white text-gray-700 font-semibold"
                >
                  <option value="ALL">Tất cả đơn hàng</option>
                  <option value="PENDING">Chờ xác nhận (COD/Momo)</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PROCESSING">Đang đóng gói</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="DELIVERED">Đã giao thành công</option>
                  <option value="DISPUTED">Đang khiếu nại ⚠️</option>
                  <option value="REFUNDED">Đã hoàn tiền ↩️</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>

                <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, tên khách..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-52"
                  />
                </div>
              </div>
            </div>

            <Table headers={['Mã Đơn Hàng', 'Khách Hàng', 'Tổng tiền', 'Phương thức', 'Trạng thái đơn', 'Giải quyết khiếu nại / Thao tác']}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Chưa có đơn hàng nào khớp bộ lọc</td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-gray-700 text-xs">
                      {o.id}
                      {o.status === 'DISPUTED' && (
                        <div className="bg-red-50 text-red-700 text-[10px] p-2.5 rounded-xl mt-1.5 max-w-[200px] leading-normal font-sans border border-red-100">
                          <strong>Lý do khiếu nại:</strong> "{o.disputeReason}"
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <p className="font-bold text-gray-955">{o.receiverName}</p>
                      <p className="text-gray-400 font-mono mt-0.5">{o.receiverPhone}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-purple-600">{formatVND(Number(o.totalAmount))}</td>
                    <td className="py-4 px-4 text-xs font-semibold">
                      <p className="text-gray-700">{o.payment?.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Momo Sandbox'}</p>
                      <Badge variant={o.payment?.paymentStatus === 'COMPLETED' ? 'success' : o.payment?.paymentStatus === 'REFUNDED' ? 'error' : 'warning'} className="mt-1">
                        {o.payment?.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-bold">
                      <Badge variant={
                        o.status === 'DELIVERED' ? 'success' :
                        o.status === 'SHIPPING' ? 'info' :
                        o.status === 'PROCESSING' ? 'purple' :
                        o.status === 'PENDING' ? 'warning' :
                        o.status === 'DISPUTED' ? 'error' : 'secondary'
                      }>
                        {o.status === 'PENDING' ? 'Chờ duyệt' :
                         o.status === 'CONFIRMED' ? 'Đã xác nhận' :
                         o.status === 'PROCESSING' ? 'Đang chuẩn bị' :
                         o.status === 'SHIPPING' ? 'Đang giao' :
                         o.status === 'DELIVERED' ? 'Đã giao' :
                         o.status === 'DISPUTED' ? 'Khiếu nại' :
                         o.status === 'REFUNDED' ? 'Hoàn tiền' : o.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {o.status === 'DISPUTED' && (
                          <>
                            <Button
                              onClick={() => handleResolveDispute(o.id, 'REFUNDED')}
                              variant="primary"
                              className="px-2.5 py-1.5 text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                              loading={isDisputeResolveLoading === o.id}
                            >
                              Duyệt Hoàn Tiền
                            </Button>
                            <Button
                              onClick={() => handleResolveDispute(o.id, 'DELIVERED')}
                              variant="secondary"
                              className="px-2.5 py-1.5 text-[10px] font-bold text-gray-700"
                              loading={isDisputeResolveLoading === o.id}
                            >
                              Bác khiếu nại
                            </Button>
                          </>
                        )}
                        {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && o.status !== 'DISPUTED' && o.status !== 'REFUNDED' && (
                          <Button
                            onClick={() => handleCancelOrder(o.id)}
                            variant="danger"
                            className="px-2.5 py-1 text-xs"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        )}

        {/* 5. TAB CERTIFICATES */}
        {activeTab === 'certificates' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-extrabold text-lg text-gray-950">Kiểm định chất lượng chất lượng nông sản</h3>
              <p className="text-xs text-gray-400 mt-0.5">Danh sách các giấy chứng nhận kiểm nghiệm (VietGAP/Organic) liên kết với mã lô hàng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-400 text-sm italic">
                  Chưa có chứng nhận chất lượng nào được đăng tải lên hệ thống.
                </div>
              ) : (
                certificates.map((c: any) => (
                  <Card key={c.id} className="flex gap-4 p-4 hover:shadow-md transition-shadow">
                    <div 
                      onClick={() => setViewCertUrl(c.imageUrl || 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format')}
                      className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105"
                      title="Click để xem ảnh lớn"
                    >
                      <img 
                        src={c.imageUrl || 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=150&auto=format'} 
                        alt={c.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format';
                        }}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-700 flex-grow">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-gray-900">{c.name}</h4>
                        <Badge variant={
                          c.status === 'APPROVED' ? 'success' :
                          c.status === 'PENDING' ? 'warning' : 'error'
                        }>
                          {c.status === 'APPROVED' ? 'Đã duyệt' : c.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                        </Badge>
                      </div>
                      <p><span className="text-gray-400 font-bold">Đơn vị cấp:</span> <span className="font-semibold">{c.issuer}</span></p>
                      <p><span className="text-gray-400 font-bold">Mã lô hàng:</span> <span className="font-mono text-purple-650 font-bold">{c.batch?.batchCode || c.batchCode}</span></p>
                      <p><span className="text-gray-400 font-bold">Hạn hiệu lực:</span> <span>{formatDate(c.validUntil)}</span></p>

                      {c.status === 'PENDING' && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            onClick={() => handleApproveCert(c.id)}
                            variant="primary"
                            className="px-2.5 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 border-none text-white font-bold"
                          >
                            Phê duyệt
                          </Button>
                          <Button
                            onClick={() => handleRejectCert(c.id)}
                            variant="danger"
                            className="px-2.5 py-1 text-[10px] text-white font-bold"
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        )}

        {/* 6. TAB FORUM MODERATION */}
        {activeTab === 'forum' && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-955">Kiểm duyệt Diễn đàn & Cộng đồng</h3>
                <p className="text-xs text-gray-400 mt-0.5">Xử lý báo cáo vi phạm nội dung từ thành viên, quản lý ghim bài viết hoặc chặn tài khoản</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setModerationSubTab('reports')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      moderationSubTab === 'reports' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Báo cáo chờ duyệt ({reports.filter(r => r.status === 'PENDING').length})
                  </button>
                  <button
                    onClick={() => setModerationSubTab('posts')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      moderationSubTab === 'posts' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tất cả bài viết ({forumPosts.length})
                  </button>
                </div>

                <Button 
                  onClick={() => {
                    setEditPostId(null);
                    setNewPostTitle('');
                    setNewPostContent('');
                    setNewPostType('ANNOUNCEMENT');
                    setIsCreatingPost(true);
                  }} 
                  className="px-4 py-2 text-xs bg-purple-600 hover:bg-purple-700 border-purple-600"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Đăng thông báo
                </Button>
              </div>
            </div>

            {/* Moderation Queue Sub-tab */}
            {moderationSubTab === 'reports' && (
              <Table headers={['Loại báo cáo', 'Nội dung bị báo cáo', 'Tác giả', 'Lý do báo cáo', 'Người báo cáo', 'Ngày báo', 'Thao tác']}>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      Không có báo cáo vi phạm nào đang chờ xử lý. Diễn đàn hoàn toàn trong sạch!
                    </td>
                  </tr>
                ) : (
                  reports.map((report: any) => {
                    const isPost = !!report.postId;
                    const contentSnippet = isPost 
                      ? (report.post?.title || 'Bài viết đã bị xóa') 
                      : (report.comment?.content || 'Bình luận đã bị xóa');
                    
                    const authorName = isPost 
                      ? (report.post?.author?.fullName || 'Ẩn danh') 
                      : (report.comment?.author?.fullName || 'Ẩn danh');
                    
                    const authorId = isPost ? report.post?.authorId : report.comment?.authorId;

                    return (
                      <tr key={report.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <Badge variant={isPost ? 'info' : 'purple'}>
                            {isPost ? 'Bài viết' : 'Bình luận'}
                          </Badge>
                          {report.status !== 'PENDING' && (
                            <Badge variant="secondary" className="ml-1.5">Đã giải quyết</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <p className="font-bold text-gray-900 truncate">{contentSnippet}</p>
                          <p className="text-gray-400 text-xs truncate mt-0.5">
                            {isPost ? (report.post?.content || '') : ''}
                          </p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900 text-xs">{authorName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-red-600 font-semibold text-xs bg-red-50 px-2.5 py-1 rounded-lg w-fit border border-red-100">
                            ⚠ {report.reason}
                          </p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-gray-700 text-xs font-bold">{report.reporter?.fullName || 'Thành viên'}</p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-gray-400 text-xs">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {report.status === 'PENDING' ? (
                            <div className="flex justify-end items-center gap-1.5">
                              <button
                                onClick={() => handleResolveReport(report.id, 'DISMISS')}
                                className="px-2.5 py-1.5 rounded-lg border border-gray-250 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all"
                                title="Bỏ qua báo cáo"
                              >
                                Bỏ qua
                              </button>
                              <button
                                onClick={() => handleResolveReport(report.id, 'HIDE')}
                                className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-all"
                                title="Ẩn nội dung vi phạm khỏi diễn đàn"
                              >
                                Ẩn đi
                              </button>
                              <button
                                onClick={() => handleResolveReport(report.id, 'DELETE')}
                                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-all"
                                title="Xóa nội dung khỏi hệ thống"
                              >
                                Xóa bỏ
                              </button>
                              {authorId && (
                                <button
                                  onClick={() => handleWarnUser(authorId, authorName)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-black text-xs font-bold transition-all"
                                  title="Cảnh cáo tác giả vi phạm"
                                >
                                  Cảnh cáo
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Đã giải quyết</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </Table>
            )}

            {/* All Posts Sub-tab */}
            {moderationSubTab === 'posts' && (
              <Table headers={['Loại', 'Trạng thái', 'Bài viết', 'Tác giả', 'Tương tác', 'Ngày đăng', 'Thao tác']}>
                {forumPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                      Chưa có bài viết nào trên diễn đàn.
                    </td>
                  </tr>
                ) : (
                  forumPosts.map((post: any) => (
                    <tr key={post.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge variant={
                          post.type === 'ANNOUNCEMENT' ? 'error' :
                          post.type === 'NEWS' ? 'info' :
                          post.type === 'TUTORIAL' ? 'success' : 'purple'
                        }>
                          {post.type === 'ANNOUNCEMENT' ? 'Thông báo' :
                           post.type === 'NEWS' ? 'Tin tức' :
                           post.type === 'TUTORIAL' ? 'Hướng dẫn' : 'Thảo luận'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {post.isPinned ? (
                          <span className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                            <Pin className="w-3.5 h-3.5 fill-current" />
                            <span>Đã ghim</span>
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                        {post.status === 'HIDDEN' && (
                          <Badge variant="error" className="ml-2 text-[10px]">Đã ẩn</Badge>
                        )}
                        {post.status === 'DRAFT' && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">Nháp</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-gray-955 truncate">{post.title}</p>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{post.content}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-gray-955 text-xs">{post.authorName}</p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{post.authorRole}</span>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center justify-center gap-3">
                          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentsCount || post.comments?.length || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-gray-400 text-xs">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            onClick={() => handleTogglePinPost(post.id)}
                            variant={post.isPinned ? 'primary' : 'outline'}
                            className={`px-2 py-1 text-xs border ${
                              post.isPinned ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' : ''
                            }`}
                            icon={<Pin className="w-3 h-3" />}
                          >
                            {post.isPinned ? 'Bỏ ghim' : 'Ghim'}
                          </Button>
                          <Button
                            onClick={() => handleEditPostInit(post)}
                            variant="outline"
                            className="px-2 py-1 text-xs border text-purple-700 hover:bg-purple-50"
                            icon={<Edit3 className="w-3 h-3" />}
                          >
                            Sửa
                          </Button>
                          <Button
                            onClick={() => handleDeletePost(post.id)}
                            variant="danger"
                            className="px-2 py-1 text-xs"
                            icon={<Trash2 className="w-3 h-3" />}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </Table>
            )}
          </Card>
        )}

        {/* Modal Announcement Form */}
        <Modal 
          isOpen={isCreatingPost} 
          onClose={() => setIsCreatingPost(false)} 
          title={editPostId ? "Cập nhật bài viết diễn đàn" : "Tạo thông báo mới từ Ban quản trị"}
        >
          <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
            <Input
              label="Tiêu đề bài viết"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              required
            />
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Chuyên mục tin
              </label>
              <select
                value={newPostType}
                onChange={(e: any) => setNewPostType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
              >
                <option value="ANNOUNCEMENT">Thông báo hệ thống</option>
                <option value="NEWS">Tin tức nông sản</option>
                <option value="TUTORIAL">Hướng dẫn kỹ thuật</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Nội dung chi tiết
              </label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Viết nội dung bài viết..."
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setIsCreatingPost(false)}
                variant="secondary"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                {editPostId ? "Lưu thay đổi" : "Xuất bản"}
              </Button>
            </div>
          </form>
        </Modal>
        {/* 7. TAB CATEGORIES */}
        {activeTab === 'categories' && (
          <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-955">Danh mục hàng hóa nông sản</h3>
                <p className="text-xs text-gray-400 mt-0.5">Quản lý phân loại sản phẩm trên sàn thương mại điện tử</p>
              </div>
              <Button 
                onClick={openCreateCategoryModal} 
                className="px-4 py-2 text-xs"
                icon={<PlusCircle className="w-4 h-4" />}
              >
                Thêm danh mục mới
              </Button>
            </div>

            <Table headers={['Tên danh mục', 'Mã liên kết / Slug', 'Hành động']}>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-400 text-sm">
                    Chưa có danh mục nào được khởi tạo.
                  </td>
                </tr>
              ) : (
                categories.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-4 px-4 font-mono text-xs text-purple-650">{c.slug}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => openEditCategoryModal(c)}
                          variant="outline"
                          className="px-2.5 py-1 text-xs"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                        >
                          Sửa
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategory(c.id)}
                          variant="danger"
                          className="px-2.5 py-1 text-xs"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        )}

        {/* Modal Category Form */}
        <Modal 
          isOpen={isCategoryModalOpen} 
          onClose={() => setIsCategoryModalOpen(false)} 
          title={editCategoryId ? "Cập nhật danh mục" : "Tạo danh mục mới"}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <Input
              label="Tên danh mục"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (!editCategoryId) {
                  setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }
              }}
              placeholder="Ví dụ: Trái Cây Sạch"
              required
            />
            
            <Input
              label="Slug liên kết (Unique URL path)"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              placeholder="ví-du-trai-cay-sach"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                variant="secondary"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                Lưu lại
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Certificate Lightbox */}
        <Modal 
          isOpen={!!viewCertUrl} 
          onClose={() => setViewCertUrl(null)} 
          title="Chi tiết Minh chứng chất lượng"
        >
          <div className="flex flex-col items-center justify-center p-2 space-y-4">
            <div className="w-full max-h-[70vh] overflow-auto border border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 p-2">
              <img 
                src={viewCertUrl || ''} 
                alt="Bản scan chứng nhận" 
                className="max-w-full h-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end w-full">
              <Button onClick={() => setViewCertUrl(null)} variant="secondary">
                Đóng
              </Button>
            </div>
          </div>
        </Modal>

        {/* ConfirmDialog Component */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
        />
      </Container>
    </RouteGuard>
  );
}
