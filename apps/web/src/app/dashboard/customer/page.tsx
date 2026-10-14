'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Skeleton } from '@cropnet/ui';
import RouteGuard from '@/shared/components/RouteGuard';
import { apiClient } from '@/shared/services/api';
import { formatVND, formatDate } from '@cropnet/utils';
import { ShoppingBag, Star, CheckCircle, Package, Truck, MessageSquare, DollarSign, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { RevenueAreaChart } from '@/shared/components/QuickCharts';
import { getAssetPath } from '@/shared/utils/path';

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingItem, setReviewingItem] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchOrdersAndStats = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        apiClient.get('/orders'),
        apiClient.get('/analytics/dashboard')
      ]);
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndStats();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;

    try {
      const res = await apiClient.post(`/products/${reviewingItem.productId}/reviews`, {
        rating,
        comment,
        orderItemId: reviewingItem.id
      });
      
      if (res.data.success) {
        alert('Đã gửi đánh giá sản phẩm thành công! Cảm ơn ý kiến đóng góp của bạn.');
        setReviewingItem(null);
        setComment('');
        setRating(5);
        fetchOrdersAndStats();
      }
    } catch (err) {
      console.warn('Failed to submit review:', err);
      alert('Gửi đánh giá thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPING': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['CUSTOMER']}>
        <Container className="py-12 space-y-8">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </Card>
        </Container>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['CUSTOMER']}>
      <div className="bg-[#FAF9F5] min-h-screen py-10 md:py-14">
        <Container className="space-y-8 max-w-4xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#253129] tracking-tight">Đơn Hàng Của Tôi</h1>
            <p className="text-[#647067] text-xs mt-1">Theo dõi hành trình nông sản và đánh giá chất lượng sản phẩm</p>
          </div>

        {/* Purchase Analytics & Statistics */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã mua tích lũy</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{formatVND(stats?.totalSpent ?? 0)}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShoppingBag className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng đơn mua</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.totalOrders ?? 0} Đơn</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Bookmark className="w-6 h-6 text-emerald-600" /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tin đã lưu</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.bookmarksCount ?? 0} Bài viết</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <RevenueAreaChart 
                data={stats?.spendingSeries?.map((s: any) => ({ name: s.name, sales: s.spent })) || []} 
                title="Lịch Sử Chi Tiêu Mua Sắm" 
              />
            </div>
            
            <div className="bg-white border border-[#E2E5DC] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#253129] mb-4">Trạng thái đơn mua</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#647067] flex items-center gap-1.5"><Package className="w-4 h-4 text-amber-600" /> Chờ xác nhận</span>
                    <span className="font-mono font-medium text-[#253129] bg-[#FAF9F5] px-2.5 py-0.5 rounded border border-[#E2E5DC]">{stats?.orderStatuses?.pending ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#647067] flex items-center gap-1.5"><Truck className="w-4 h-4 text-sky-600" /> Đang giao</span>
                    <span className="font-mono font-medium text-[#253129] bg-[#FAF9F5] px-2.5 py-0.5 rounded border border-[#E2E5DC]">{stats?.orderStatuses?.shipping ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#647067] flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#2C4939]" /> Đã giao</span>
                    <span className="font-mono font-medium text-[#253129] bg-[#FAF9F5] px-2.5 py-0.5 rounded border border-[#E2E5DC]">{stats?.orderStatuses?.delivered ?? 0}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E2E5DC] text-center">
                <Link href="/products" className="text-xs text-[#2C4939] font-medium hover:underline">
                  ➔ Tiếp tục mua sắm nông sản
                </Link>
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-20 space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-400">Bạn chưa có đơn hàng nào.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {orders.map((order: any) => {
              const currentStep = getStatusStep(order.status);
              return (
                <Card key={order.id} className="p-6 space-y-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
                    <div>
                      <p className="text-[11px] font-medium text-[#647067] uppercase">Mã đơn hàng</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium text-[#253129] text-xs">{order.id}</span>
                        <Link href={`/orders/${order.id}`} className="text-xs text-[#2C4939] hover:underline font-medium">
                          Theo dõi chi tiết ➔
                        </Link>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-[11px] font-medium text-[#647067] uppercase">Ngày đặt hàng</p>
                      <p className="font-mono text-[#253129] text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-[#647067] uppercase">Tổng tiền</p>
                      <p className="font-mono font-bold text-sm text-[#2C4939]">{formatVND(Number(order.totalAmount))}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.orderItems?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAssetPath(item.product?.images?.[0]?.url || item.product?.imageUrl) || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=150&auto=format'}
                            alt={item.product?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.product?.name}</p>
                            <p className="text-xs text-gray-400">Số lượng: {item.quantity} x {formatVND(Number(item.price))}</p>
                          </div>
                        </div>
                        {order.status === 'DELIVERED' && (
                          <button
                            onClick={() => setReviewingItem(item)}
                            className="flex items-center gap-1 border border-primary-100 bg-primary-50/50 text-primary-600 hover:bg-primary-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Đánh giá</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Status Timeline */}
                  <div className="pt-4 border-t border-[#E2E5DC]">
                    <p className="text-[11px] font-medium text-[#647067] uppercase mb-4">Trạng thái giao hàng</p>
                    <div className="flex justify-between items-center relative">
                      {/* Progress Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E2E5DC] -translate-y-1/2 -z-10"></div>
                      <div
                        className="absolute top-1/2 left-0 h-0.5 bg-[#2C4939] -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                      ></div>

                      {/* Steps */}
                      {[
                        { label: 'Chờ duyệt', icon: Package, step: 1 },
                        { label: 'Đã xác nhận', icon: CheckCircle, step: 2 },
                        { label: 'Đang giao', icon: Truck, step: 3 },
                        { label: 'Đã nhận', icon: CheckCircle, step: 4 }
                      ].map((s) => {
                        const Icon = s.icon;
                        const isActive = currentStep >= s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center gap-1.5 bg-white px-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${isActive ? 'bg-[#2C4939] border-[#2C4939] text-white shadow-sm' : 'bg-white border-[#E2E5DC] text-[#647067]'}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-[#2C4939]' : 'text-[#647067]'}`}>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Review Dialog Modal */}
        {reviewingItem && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E5DC] rounded-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 shadow-lg">
              <div className="flex justify-between items-center border-b border-[#E2E5DC] pb-3">
                <h3 className="font-serif font-bold text-base text-[#253129]">Đánh giá sản phẩm</h3>
                <button onClick={() => setReviewingItem(null)} className="text-[#647067] hover:text-[#253129] font-bold">✕</button>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={getAssetPath(reviewingItem.product?.images?.[0]?.url || reviewingItem.product?.imageUrl)}
                  alt={reviewingItem.product?.name}
                  className="w-12 h-12 rounded-lg object-cover border border-[#E2E5DC]"
                />
                <div>
                  <h4 className="font-medium text-[#253129] text-xs">{reviewingItem.product?.name}</h4>
                  <p className="text-[11px] text-[#647067]">Nhà vườn: {reviewingItem.product?.supplier?.farmName || 'HTX Nông Nghiệp Tân Triều'}</p>
                </div>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#253129] block">Đánh giá sao</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-500 focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : 'stroke-current text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#253129] block">Nhận xét chất lượng</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Hãy chia sẻ nhận xét của bạn về độ tươi ngọt và cách đóng gói nông sản..."
                    className="w-full bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg p-3 text-xs focus:outline-none focus:border-[#2C4939] focus:bg-white text-[#253129]"
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-[#2C4939] text-white font-medium text-xs py-3 rounded-lg hover:bg-[#233C2F] transition-colors">
                  Gửi nhận xét
                </button>
              </form>
            </div>
          </div>
        )}
        </Container>
      </div>
    </RouteGuard>
  );
}
