'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Container } from '@cropnet/ui';
import { formatVND } from '@cropnet/utils';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/shared/services/api';

function MomoPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount') || '100000';
  const [loading, setLoading] = useState(false);

  const handlePaySuccess = async () => {
    setLoading(true);
    try {
      // Call the Express API callback webhook endpoint
      const response = await apiClient.post('/payments/momo/callback', {
        orderId,
        resultCode: 0,
        transId: `MOMO-TRANS-${Date.now()}`
      });

      alert('Thanh toán thành công! Hệ thống Momo đã thông báo lại cho CropNet.');
      router.push('/dashboard/customer');
    } catch (error) {
      console.warn('Callback failed:', error);
      alert('Có lỗi xảy ra khi xác nhận thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full border-t-8 border-pink-600 p-8 space-y-6 shadow-xl bg-white">
      {/* Momo Branding Logo */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white font-extrabold text-lg">Mo</div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Cổng Thanh Toán MoMo</h3>
            <p className="text-xs text-gray-400">Giao dịch thử nghiệm (Sandbox)</p>
          </div>
        </div>
        <CreditCard className="w-6 h-6 text-pink-600" />
      </div>

      {/* Payment Summary */}
      <div className="bg-pink-50/50 p-4 rounded-2xl text-sm space-y-2 border border-pink-100/50">
        <p className="flex justify-between"><span className="text-gray-500">Mã đơn hàng:</span> <span className="font-mono font-bold text-gray-800">{orderId}</span></p>
        <p className="flex justify-between"><span className="text-gray-500">Số tiền cần trả:</span> <span className="font-extrabold text-pink-600 text-base">{formatVND(Number(amount))}</span></p>
      </div>

      {/* QR Code and Instructions */}
      <div className="text-center space-y-4">
        <div className="p-3 border border-pink-100 rounded-2xl bg-white shadow-sm inline-block mx-auto">
          {/* Standard dummy QR code simulating payment scan */}
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MomoPayment-${orderId}`} alt="Momo QR Code" className="w-36 h-36" />
        </div>
        <p className="text-xs text-gray-400 px-4">Quét mã QR bằng ứng dụng MoMo để thanh toán hoặc click nút bên dưới để hoàn tất giao dịch tự động.</p>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handlePaySuccess}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Xác nhận thanh toán thành công</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            alert('Giao dịch đã được hủy.');
            router.push('/cart');
          }}
          className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
        >
          <XCircle className="w-5 h-5 text-gray-400" />
          <span>Hủy giao dịch</span>
        </button>
      </div>
    </Card>
  );
}

export default function MomoPortalPage() {
  return (
    <Container className="py-20 flex justify-center items-center bg-gray-50 min-h-screen">
      <Suspense fallback={
        <Card className="max-w-md w-full p-8 text-center space-y-4 shadow-xl bg-white">
          <p className="text-gray-500">Đang tải cổng thanh toán...</p>
        </Card>
      }>
        <MomoPortalContent />
      </Suspense>
    </Container>
  );
}
