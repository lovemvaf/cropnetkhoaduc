'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Skeleton } from '@cropnet/ui';
import RouteGuard from '@/shared/components/RouteGuard';
import { apiClient } from '@/shared/services/api';
import { formatVND, formatDate } from '@cropnet/utils';
import { ShoppingBag, Star, CheckCircle, Package, Truck, MessageSquare, DollarSign, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { RevenueAreaChart } from '@/shared/components/QuickCharts';

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
      <Container className="py-12 space-y-8 max-w-4xl">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Đơn Hàng Của Tôi</h2>
          <p className="text-gray-400 text-sm">Theo dõi và đánh giá chất lượng nông sản đã mua</p>
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
            
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-800 mb-4 uppercase tracking-wider text-xs">Trạng thái đơn mua</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Package className="w-4 h-4 text-amber-500" /> Chờ xác nhận</span>
                    <span className="font-bold text-gray-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">{stats?.orderStatuses?.pending ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Truck className="w-4 h-4 text-sky-500" /> Đang giao</span>
                    <span className="font-bold text-gray-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">{stats?.orderStatuses?.shipping ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Đã giao</span>
                    <span className="font-bold text-gray-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">{stats?.orderStatuses?.delivered ?? 0}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 text-center">
                <Link href="/marketplace" className="text-xs text-primary-500 font-black hover:underline">
                  ➔ Tiếp tục mua sắm sạch
                </Link>
              </div>
            </Card>
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
                      <p className="text-xs font-bold text-gray-400 uppercase">Mã đơn hàng</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-semibold text-gray-800 text-sm">{order.id}</span>
                        <Link href={`/orders/${order.id}`} className="text-xs text-primary-500 hover:underline font-bold">
                          Theo dõi chi tiết ➔
                        </Link>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase">Ngày đặt hàng</p>
                      <p className="font-semibold text-gray-800 text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Tổng tiền</p>
                      <p className="font-extrabold text-primary-500">{formatVND(Number(order.totalAmount))}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.orderItems?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.images?.[0]?.url || item.product?.imageUrl || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=150&auto=format'}
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
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-4">Trạng thái giao hàng</p>
                    <div className="flex justify-between items-center relative">
                      {/* Progress Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>
                      <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary-500 -translate-y-1/2 -z-10 transition-all duration-500"
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-primary-500 border-primary-500 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>{s.label}</span>
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
            <Card className="max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-lg text-gray-900">Đánh giá sản phẩm</h3>
                <button onClick={() => setReviewingItem(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={reviewingItem.product?.images?.[0]?.url || reviewingItem.product?.imageUrl}
                  alt={reviewingItem.product?.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{reviewingItem.product?.name}</h4>
                  <p className="text-xs text-gray-400">Nhà vườn: HTX Cái Mơn</p>
                </div>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">Đánh giá sao</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-400 focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : 'stroke-current text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">Nhận xét nhận hàng</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Hãy chia sẻ nhận xét của bạn về độ tươi ngọt và đóng gói sản phẩm..."
                    className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-primary-500"
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-2xl hover:bg-primary-600 transition-colors">
                  Gửi nhận xét
                </button>
              </form>
            </Card>
          </div>
        )}
      </Container>
    </RouteGuard>
  );
}
