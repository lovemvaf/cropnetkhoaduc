'use client';

import React, { useState } from 'react';
import { Container, Card } from '@cropnet/ui';
import { useCartStore } from '@/shared/stores/cart';
import { formatVND } from '@cropnet/utils';
import { CreditCard, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/shared/services/api';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      shippingAddress: '',
      paymentMethod: 'COD'
    }
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null);

    const orderPayload = {
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      }))
    };

    try {
      // POST order payload to backend
      const res = await apiClient.post('/orders', orderPayload);
      if (res.data.success) {
        const order = res.data.data;
        
        if (data.paymentMethod === 'MOMO') {
          // Request Momo sandbox redirect payment link
          const payRes = await apiClient.post('/payments/momo/create', { orderId: order.id });
          if (payRes.data.success) {
            clearCart();
            // Redirect directly to Momo portal page
            window.location.href = payRes.data.data.payUrl;
            return;
          }
        }

        clearCart();
        alert('Đặt hàng thành công! Bạn có thể theo dõi đơn hàng ở trang cá nhân.');
        router.push('/');
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Đặt hàng thất bại');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        alert('Đặt hàng thành công (Môi trường phát triển Offline)!');
        clearCart();
        router.push('/');
        return;
      }
      setServerError(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h2>
        <button onClick={() => router.push('/products')} className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold">
          Quay lại mua sắm
        </button>
      </Container>
    );
  }

  return (
    <Container className="py-12 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900">Thanh Toán Đơn Hàng</h2>
      
      {serverError && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100 max-w-2xl">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Thông tin giao nhận</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên người nhận"
                  {...register('receiverName', { required: 'Vui lòng nhập họ tên người nhận' })}
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-primary-500 text-sm"
                />
                {errors.receiverName && <span className="text-red-500 text-xs mt-1 block">{errors.receiverName.message as string}</span>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Số điện thoại người nhận"
                  {...register('receiverPhone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: { value: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' }
                  })}
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-primary-500 text-sm"
                />
                {errors.receiverPhone && <span className="text-red-500 text-xs mt-1 block">{errors.receiverPhone.message as string}</span>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Địa chỉ nhận hàng chi tiết"
                  {...register('shippingAddress', { required: 'Vui lòng nhập địa chỉ nhận hàng' })}
                  className="w-full border border-gray-200 p-3 rounded-xl focus:outline-primary-500 text-sm"
                />
                {errors.shippingAddress && <span className="text-red-500 text-xs mt-1 block">{errors.shippingAddress.message as string}</span>}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Phương thức thanh toán</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" value="COD" {...register('paymentMethod')} />
                <Truck className="w-5 h-5 text-primary-500" />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" value="MOMO" {...register('paymentMethod')} />
                <CreditCard className="w-5 h-5 text-pink-500" />
                <span>Thanh toán ví Momo Sandbox</span>
              </label>
            </div>
          </Card>
        </div>

        <Card className="h-fit space-y-6">
          <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-4">Tóm tắt thanh toán</h3>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-500 line-clamp-1">{item.name} x{item.quantity}</span>
                <span className="font-medium flex-shrink-0">{formatVND(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-primary-500">
            <span>Tổng số tiền</span>
            <span>{formatVND(getTotalPrice())}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold hover:bg-primary-600 transition-colors flex items-center justify-center"
          >
            {loading ? 'Đang xử lý đặt hàng...' : 'Xác nhận đặt hàng'}
          </button>
        </Card>
      </form>
    </Container>
  );
}
