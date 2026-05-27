'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Modal, Input } from '@cropnet/ui';
import { 
  CheckCircle2, Circle, Truck, User, Phone, MapPin, Calendar, 
  CreditCard, ShieldAlert, ArrowLeft, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import { formatVND, formatDate } from '@cropnet/utils';
import Link from 'next/link';
import { getAssetPath } from '@/shared/utils/path';

export default function OrderTrackingPageClient() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load order tracking details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setSubmittingDispute(true);
    try {
      const res = await apiClient.post(`/orders/${id}/dispute`, { reason: disputeReason });
      if (res.data.success) {
        alert('Gửi khiếu nại thành công! Ban Quản Trị sẽ liên hệ giải quyết trong vòng 24h.');
        setIsDisputeModalOpen(false);
        setDisputeReason('');
        fetchOrderDetails();
      }
    } catch (err) {
      console.warn(err);
      alert('Không thể gửi khiếu nại. Vui lòng thử lại.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12 space-y-6 max-w-2xl animate-pulse text-gray-400">
        <div className="h-6 bg-gray-150 rounded w-1/4"></div>
        <Card className="h-64 bg-gray-100 rounded-2xl"><div /></Card>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-20 text-center space-y-4 max-w-md">
        <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto" />
        <h3 className="text-xl font-extrabold text-gray-900">Không tìm thấy đơn hàng</h3>
        <p className="text-sm text-gray-500">Mã đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link href="/dashboard/customer" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
          Quay lại dashboard
        </Link>
      </Container>
    );
  }

  const shipment = order.shipment || null;
  const payment = order.payment || null;
  const history = shipment?.trackingHistory || [];

  return (
    <Container className="py-12 max-w-3xl space-y-6">
      {/* Back link */}
      <Link 
        href="/dashboard/customer" 
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-bold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại Đơn hàng của tôi</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hành Trình Vận Đơn</h2>
          <p className="text-gray-400 text-xs font-semibold uppercase font-mono mt-1">Mã đơn: #{order.id}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchOrderDetails} 
            variant="outline" 
            className="p-2.5 rounded-xl"
            icon={<RefreshCw className="w-4 h-4 text-gray-500" />}
          >
            Làm mới
          </Button>
          {order.status === 'DELIVERED' && (
            <Button 
              onClick={() => setIsDisputeModalOpen(true)} 
              variant="danger" 
              className="px-4 py-2.5 rounded-xl"
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              Khiếu nại đơn hàng
            </Button>
          )}
        </div>
      </div>

      {/* Main Tracking Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Col: Timeline tracking */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-gray-950 text-base">Hành trình giao nhận</h3>
            <Badge variant={
              order.status === 'DELIVERED' ? 'success' :
              order.status === 'SHIPPING' ? 'info' :
              order.status === 'PENDING' ? 'warning' :
              order.status === 'DISPUTED' ? 'purple' : 'secondary'
            }>
              {order.status === 'PENDING' ? 'Chờ xác nhận' :
               order.status === 'CONFIRMED' ? 'Đã xác nhận' :
               order.status === 'PROCESSING' ? 'Đang chuẩn bị hàng' :
               order.status === 'SHIPPING' ? 'Đang giao hàng' :
               order.status === 'DELIVERED' ? 'Đã giao thành công' :
               order.status === 'DISPUTED' ? 'Đang khiếu nại' :
               order.status === 'REFUNDED' ? 'Đã hoàn tiền' : order.status}
            </Badge>
          </div>

          {/* Timeline rendering */}
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs italic space-y-2">
              <Truck className="w-8 h-8 mx-auto opacity-40 text-gray-300" />
              <p>Hợp tác xã đang phân loại & đóng gói sản phẩm của bạn.</p>
              <p className="text-[10px] font-bold text-primary-500">Mã lô nông sản sẽ được đính kèm khi giao hàng</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-gray-200 ml-3 space-y-8 py-2">
              {history.map((step: any, idx: number) => {
                const isLast = idx === history.length - 1;
                return (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <span 
                      className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                        isLast ? 'bg-primary-500 ring-4 ring-primary-100 animate-ping-slow' : 'bg-gray-300'
                      }`}
                    />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className={`font-bold text-sm ${isLast ? 'text-primary-500' : 'text-gray-800'}`}>
                          {step.title}
                        </h4>
                        <span className="text-[10px] text-gray-450 font-semibold">{formatDate(step.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>Vị trí: {step.location}</span>
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right Col: Driver info, recipient address, payment */}
        <div className="space-y-6">
          {/* Driver details (Only if in SHIPPING/DELIVERED) */}
          {shipment && shipment.shipperName && (
            <Card className="p-5 space-y-3.5 border-l-4 border-sky-500 bg-sky-50/10">
              <h4 className="font-bold text-xs uppercase text-sky-600 tracking-wider">Thông tin người giao</h4>
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center"><User className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-gray-900">{shipment.shipperName}</p>
                    <p className="text-gray-400 text-[10px]">Tài xế trung chuyển CropNet</p>
                  </div>
                </div>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-sky-400" />
                  <a href={`tel:${shipment.shipperPhone}`} className="font-bold text-sky-600 underline">{shipment.shipperPhone}</a>
                </p>
                <div className="bg-white border border-sky-100 rounded-xl p-2 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mã vận đơn:</span>
                    <span className="font-bold">{shipment.trackingCode}</span>
                  </div>
                  {shipment.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hẹn giao:</span>
                      <span className="font-bold text-gray-800">{formatDate(shipment.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Dispute details if present */}
          {order.status === 'DISPUTED' && (
            <Card className="p-5 space-y-3 border-l-4 border-purple-500 bg-purple-50/10">
              <h4 className="font-bold text-xs uppercase text-purple-700 tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                Đơn hàng đang khiếu nại
              </h4>
              <div className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded-xl border border-purple-100">
                <p className="font-bold text-purple-950">Lý do khiếu nại:</p>
                <p className="italic">"{order.disputeReason}"</p>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">Ban kiểm soát đang đối chứng với nhà vườn và kiểm định chặng cuối. Trạng thái giải quyết sẽ cập nhật sớm nhất.</p>
            </Card>
          )}

          {order.status === 'REFUNDED' && (
            <Card className="p-5 space-y-3 border-l-4 border-red-500 bg-red-50/10">
              <h4 className="font-bold text-xs uppercase text-red-700 tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                Đã hoàn tiền đơn hàng
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-700">Hình thức hoàn tiền:</p>
                <p className="font-semibold text-red-600">Trả tiền mặt hoặc chuyển khoản MoMo</p>
              </div>
              <p className="text-[10px] text-gray-400">Đơn hàng được hủy hoàn toàn. Các sản phẩm được cộng lại số lượng vào kho nông trại.</p>
            </Card>
          )}

          {/* Delivery destination card */}
          <Card className="p-5 space-y-3.5">
            <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Thông tin giao nhận</h4>
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
              <p><span className="text-gray-450 font-bold">Người nhận:</span> <span className="font-semibold">{order.receiverName}</span></p>
              <p><span className="text-gray-450 font-bold">Số điện thoại:</span> <span className="font-mono font-semibold">{order.receiverPhone}</span></p>
              <p className="flex items-start gap-1"><MapPin className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" /> <span>{order.shippingAddress}</span></p>
            </div>
          </Card>

          {/* Payment info card */}
          {payment && (
            <Card className="p-5 space-y-3.5">
              <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Chi tiết thanh toán</h4>
              <div className="space-y-2.5 text-xs text-gray-750">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Phương thức:</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-primary-500" />
                    {payment.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Momo Sandbox'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Trạng thái ví:</span>
                  <Badge variant={payment.paymentStatus === 'COMPLETED' ? 'success' : payment.paymentStatus === 'REFUNDED' ? 'error' : 'warning'}>
                    {payment.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : 
                     payment.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chờ thanh toán'}
                  </Badge>
                </div>
                {payment.paidAt && (
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Thanh toán lúc:</span>
                    <span>{formatDate(payment.paidAt)}</span>
                  </div>
                )}
                {payment.transactionId && (
                  <div className="flex justify-between items-center font-mono text-[9px] text-gray-400 border-t border-gray-50 pt-2">
                    <span>Mã GD:</span>
                    <span>{payment.transactionId}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Item summary */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-gray-950 text-base border-b border-gray-50 pb-2">Nông sản đặt mua</h3>
        <div className="space-y-4">
          {order.orderItems?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <img 
                  src={getAssetPath(item.product?.images?.[0]?.url || item.product?.imageUrl) || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=100&auto=format'} 
                  alt={item.product?.name} 
                  className="w-10 h-10 rounded-lg object-cover" 
                />
                <div>
                  <h4 className="font-bold text-gray-900">{item.product?.name}</h4>
                  {item.batch?.batchCode && (
                    <p className="text-[10px] mt-0.5">
                      <span className="text-gray-400 font-bold">Lô đính kèm:</span>{' '}
                      <Link href={`/traceability/${item.batch.batchCode}`} className="font-mono font-bold text-purple-600 hover:underline">
                        {item.batch.batchCode}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
              <span className="font-semibold text-gray-600">{item.quantity} {item.product?.unit} x {formatVND(Number(item.price))}</span>
            </div>
          ))}
          <div className="border-t border-gray-50 pt-3 flex justify-between font-extrabold text-sm text-primary-500">
            <span>Tổng cộng</span>
            <span>{formatVND(Number(order.totalAmount))}</span>
          </div>
        </div>
      </Card>

      {/* Dispute Modal Form */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Yêu cầu khiếu nại đơn hàng"
      >
        <form onSubmit={handleDisputeSubmit} className="space-y-4 pt-2">
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Chú ý:</strong> Khiếu nại chỉ được duyệt nếu hàng hóa bị dập nát, hư hỏng hoặc sai lệch cân nặng thực tế khi nhận. Hãy nhập chi tiết sự cố dưới đây.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Mô tả sự cố & Lý do khiếu nại</label>
            <textarea
              rows={4}
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Nhập lý do: Rau bị héo dập nát, thiếu số lượng cân..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setIsDisputeModalOpen(false)}
              variant="secondary"
              className="text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={submittingDispute}
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700"
            >
              Gửi yêu cầu khiếu nại
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
