'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Modal, Input, ConfirmDialog, Skeleton } from '@cropnet/ui';
import RouteGuard from '@/shared/components/RouteGuard';
import { apiClient } from '@/shared/services/api';
import { formatVND, formatDate } from '@cropnet/utils';
import { 
  Truck, MapPin, Phone, User, CheckCircle2, ShieldAlert, 
  Calendar, RefreshCw, PlusCircle, Activity, Plus, AlertTriangle 
} from 'lucide-react';
import { ShipmentBarChart } from '@/shared/components/QuickCharts';

export default function LogisticsDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'transit'>('dispatch');
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

  // Dispatch modal states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [shipperName, setShipperName] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [estDelivery, setEstDelivery] = useState('');
  const [submittingDispatch, setSubmittingDispatch] = useState(false);

  // Milestone modal states
  const [milestoneOrder, setMilestoneOrder] = useState<any>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneLoc, setMilestoneLoc] = useState('');
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  const fetchShipmentsAndStats = async () => {
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
      console.warn('Failed to load logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentsAndStats();
  }, []);

  // Form triggers
  const openDispatchModal = (order: any) => {
    setSelectedOrder(order);
    setShipperName('Nguyễn Văn Hùng');
    setShipperPhone('0912345678');
    setTrackingCode(`VNPOST-${order.id.substring(0, 8).toUpperCase()}`);
    
    // Set default est delivery to 2 days from now
    const twoDaysLater = new Date(Date.now() + 86400 * 2000).toISOString().split('T')[0];
    setEstDelivery(twoDaysLater);
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmittingDispatch(true);
    try {
      const res = await apiClient.post(`/orders/${selectedOrder.id}/shipment`, {
        shipperName,
        shipperPhone,
        trackingCode,
        estimatedDelivery: estDelivery
      });
      if (res.data.success) {
        alert('Tạo vận đơn và phân phối shipper thành công!');
        setSelectedOrder(null);
        fetchShipmentsAndStats();
      }
    } catch (err: any) {
      console.warn(err);
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Phân phối vận chuyển thất bại.');
    } finally {
      setSubmittingDispatch(false);
    }
  };

  const handleAddMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneOrder) return;

    setSubmittingMilestone(true);
    try {
      const res = await apiClient.post(`/orders/${milestoneOrder.id}/shipment/milestone`, {
        title: milestoneTitle,
        description: milestoneDesc,
        location: milestoneLoc
      });
      if (res.data.success) {
        alert('Cập nhật lộ trình giao hàng thành công!');
        setMilestoneOrder(null);
        setMilestoneTitle('');
        setMilestoneDesc('');
        setMilestoneLoc('');
        fetchShipmentsAndStats();
      }
    } catch (err: any) {
      console.warn(err);
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Thêm cột mốc lộ trình thất bại.');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleDeliverComplete = (orderId: string) => {
    triggerConfirm({
      title: 'Hoàn tất giao hàng',
      message: 'Xác nhận khách hàng đã nhận hàng và đã thanh toán đầy đủ (nếu có)?',
      variant: 'primary',
      onConfirm: async () => {
        try {
          // First add delivered milestone
          await apiClient.post(`/orders/${orderId}/shipment/milestone`, {
            title: 'Đã giao hàng thành công',
            description: 'Đơn hàng đã bàn giao thành công cho khách hàng. Người nhận ký tên xác nhận nguyên vẹn.',
            location: 'Điểm nhận của khách hàng'
          });

          // Update status to DELIVERED
          const res = await apiClient.patch(`/orders/${orderId}/status`, { status: 'DELIVERED' });
          if (res.data.success) {
            alert('Đã hoàn tất giao nhận và thu COD đơn hàng!');
            fetchShipmentsAndStats();
          }
        } catch (err) {
          console.warn(err);
          alert('Không thể hoàn tất giao hàng.');
        }
      }
    });
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['LOGISTICS']}>
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
            <Skeleton className="h-72 w-full rounded-2xl" />
          </Card>
        </Container>
      </RouteGuard>
    );
  }

  // Filter orders based on tabs
  // Awaiting dispatch: PROCESSING (packed by suppliers)
  // In transit: SHIPPING
  const awaitingDispatchOrders = orders.filter(o => o.status === 'PROCESSING');
  const inTransitOrders = orders.filter(o => o.status === 'SHIPPING');

  const activeOrdersList = activeTab === 'dispatch' ? awaitingDispatchOrders : inTransitOrders;

  return (
    <RouteGuard allowedRoles={['LOGISTICS']}>
      <Container className="py-12 space-y-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Trung Tâm Vận Chuyển</h2>
            <p className="text-gray-400 text-sm">Điều phối tài xế, cập nhật lộ trình giao hàng trực tuyến cho CropNet</p>
          </div>
          <Button 
            onClick={fetchShipmentsAndStats} 
            variant="outline" 
            className="px-4 py-2 text-xs font-bold"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng vận đơn</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.totalShipments ?? 0} Vận đơn</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow border-l-4 border-red-500">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Vận đơn trễ hẹn</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.delayedShipments ?? 0} Đơn</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Chờ gom hàng</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.statusCounts?.picking ?? 0} Đơn</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đang trung chuyển</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.statusCounts?.inTransit ?? 0} Đơn</p>
            </div>
          </Card>
        </div>

        {/* Proactive Delay Alerts Panel */}
        {stats?.delayedShipments > 0 && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm uppercase">Cảnh Báo Chậm Trễ Giao Hàng</h4>
              <p className="text-xs mt-1 text-red-700 leading-normal font-semibold">
                Phát hiện <strong>{stats.delayedShipments} đơn hàng</strong> đã nằm trong trạng thái trung chuyển (IN_TRANSIT) hơn 48 tiếng mà chưa cập nhật cột mốc chặng cuối hoặc ký xác nhận. Vui lòng kiểm tra lộ trình chi tiết và liên hệ gấp với điều phối viên/shipper để xử lý!
              </p>
            </div>
          </div>
        )}

        {/* Charts & Delivery Analytics */}
        <div className="grid grid-cols-1 gap-6">
          <ShipmentBarChart data={stats?.deliverySeries || []} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6 text-sm font-bold text-gray-400 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'dispatch' ? 'border-primary-500 text-primary-500' : 'border-transparent hover:text-gray-600'}`}
          >
            <span>Chờ điều phối tài xế</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">
              {awaitingDispatchOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('transit')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'transit' ? 'border-primary-500 text-primary-500' : 'border-transparent hover:text-gray-600'}`}
          >
            <span>Đơn hàng đang giao</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
              {inTransitOrders.length}
            </span>
          </button>
        </div>

        {/* Orders List */}
        {activeOrdersList.length === 0 ? (
          <Card className="text-center py-20 space-y-4">
            <Truck className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-400 text-sm">Không có đơn vận nào cần xử lý trong mục này.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {activeOrdersList.map((order: any) => (
              <Card key={order.id} className="p-6 space-y-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block">MÃ VẬN ĐƠN</span>
                    <span className="font-mono font-bold text-gray-805 text-sm">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">HÌNH THỨC CƯỚC</span>
                    <span className="font-bold text-gray-800">
                      {order.payment?.paymentMethod === 'COD' ? 'Thu hộ COD' : 'Momo Sandbox'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">CẦN THU TIỀN</span>
                    <span className="font-extrabold text-primary-500 text-sm">{formatVND(Number(order.totalAmount))}</span>
                  </div>
                  <div>
                    <Badge variant={order.status === 'SHIPPING' ? 'info' : 'warning'}>
                      {order.status === 'PROCESSING' ? 'Chờ chia shipper' : 'Đang giao hàng'}
                    </Badge>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-655">
                  <div className="space-y-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <p className="font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-1.5 mb-2 text-xs">
                      <User className="w-4 h-4 text-gray-400" /> 
                      Thông tin khách nhận
                    </p>
                    <p><span className="text-gray-400 font-bold">Người nhận:</span> <span className="font-bold text-gray-900">{order.receiverName}</span></p>
                    <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> <span>SĐT: <span className="font-mono font-bold text-gray-700">{order.receiverPhone}</span></span></p>
                    <p className="flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" /> <span>Địa chỉ: {order.shippingAddress}</span></p>
                  </div>

                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <p className="font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-1.5 mb-2 text-xs">
                      <Truck className="w-4 h-4 text-gray-400" /> 
                      Sản phẩm & Lô đính kèm
                    </p>
                    <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                      {order.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-2 border border-gray-100 rounded-lg">
                          <span className="font-bold text-gray-850">{item.product?.name} (x{item.quantity})</span>
                          <span className="font-mono text-[10px] text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded font-bold">
                            Lô: {item.batch?.batchCode || 'Chưa gán'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tracking Milestones for SHIPPING */}
                {order.status === 'SHIPPING' && order.shipment && (
                  <div className="bg-sky-50/10 border border-sky-100 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-sky-100/50 pb-2">
                      <span className="font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Lịch trình chặng cuối
                      </span>
                      <span className="text-gray-400">Shipper: <strong className="text-gray-700">{order.shipment.shipperName}</strong> ({order.shipment.shipperPhone})</span>
                    </div>

                    {order.shipment.trackingHistory && order.shipment.trackingHistory.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {order.shipment.trackingHistory.map((step: any, sidx: number) => (
                          <div key={sidx} className="flex items-start gap-2 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <p className="font-bold text-gray-800">{step.title} <span className="text-[10px] text-gray-400 font-normal ml-2">@{step.location}</span></p>
                              <p className="text-gray-550 text-[10px] mt-0.5">{step.description}</p>
                            </div>
                            <span className="text-[9px] text-gray-400 flex-shrink-0 mt-0.5">{formatDate(step.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-[10px]">Chưa ghi nhận cột mốc nào.</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-150 flex justify-end gap-3">
                  {order.status === 'PROCESSING' && (
                    <Button
                      onClick={() => openDispatchModal(order)}
                      variant="primary"
                      className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border-none px-4 py-2"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Bàn giao Shipper & Tạo vận đơn
                    </Button>
                  )}
                  {order.status === 'SHIPPING' && (
                    <>
                      <Button
                        onClick={() => setMilestoneOrder(order)}
                        variant="outline"
                        className="text-xs font-bold px-4 py-2"
                        icon={<PlusCircle className="w-4 h-4 text-sky-600" />}
                      >
                        Cập nhật lộ trình
                      </Button>
                      <Button
                        onClick={() => handleDeliverComplete(order.id)}
                        variant="primary"
                        className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 border-none px-4 py-2"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Xác nhận đã giao hàng
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Dispatch Shipper Assignment */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Bàn giao Shipper & Khởi tạo Vận đơn"
        >
          {selectedOrder && (
            <form onSubmit={handleDispatchSubmit} className="space-y-4 pt-2">
              <Input
                label="Họ tên nhân viên giao hàng (Shipper)"
                value={shipperName}
                onChange={(e) => setShipperName(e.target.value)}
                required
              />
              <Input
                label="Số điện thoại Shipper"
                value={shipperPhone}
                onChange={(e) => setShipperPhone(e.target.value)}
                required
              />
              <Input
                label="Mã số vận đơn (Tracking Code)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                required
              />
              <Input
                label="Ngày dự kiến giao hàng (Estimated Delivery)"
                type="date"
                value={estDelivery}
                onChange={(e) => setEstDelivery(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  variant="secondary"
                  className="text-xs font-bold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white"
                  loading={submittingDispatch}
                >
                  Lưu & Khởi tạo vận chuyển
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal: Add Milestone */}
        <Modal
          isOpen={!!milestoneOrder}
          onClose={() => setMilestoneOrder(null)}
          title="Cập nhật Lộ trình giao chặng cuối"
        >
          {milestoneOrder && (
            <form onSubmit={handleAddMilestoneSubmit} className="space-y-4 pt-2">
              <Input
                label="Tiêu đề cột mốc (Milestone Title)"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="Ví dụ: Đang đi giao, Đã đến kho trung chuyển..."
                required
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Ví dụ: Đơn hàng đang được shipper giao nội khu vực..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <Input
                label="Địa điểm ghi nhận (Location)"
                value={milestoneLoc}
                onChange={(e) => setMilestoneLoc(e.target.value)}
                placeholder="Ví dụ: Quận 7, TP. HCM"
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setMilestoneOrder(null)}
                  variant="secondary"
                  className="text-xs font-bold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white"
                  loading={submittingMilestone}
                >
                  Thêm Cột Mốc
                </Button>
              </div>
            </form>
          )}
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
