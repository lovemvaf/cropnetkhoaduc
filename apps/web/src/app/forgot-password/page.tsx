'use client';

import React, { useState } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null);
    setMessage(null);
    setDemoToken(null);
    try {
      const res = await apiClient.post('/auth/forgot-password', {
        email: data.email
      });

      if (res.data.success) {
        setMessage(res.data.message || 'Mã khôi phục mật khẩu đã được gửi!');
        // In offline/dev environment, the API returns the token directly for testing
        if (res.data.data && res.data.data.resetToken) {
          setDemoToken(res.data.data.resetToken);
        }
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Yêu cầu thất bại');
      }
    } catch (err: any) {
      // Mock fallback for network error
      if (err.code === 'ERR_NETWORK') {
        const testEmails = ['admin@cropnet.vn', 'khachhang@gmail.com', 'farmer@nongnghiep.vn', 'logistics@cropnet.vn', 'inspector@cropnet.vn'];
        if (testEmails.includes(data.email)) {
          setMessage('Mã khôi phục mật khẩu đã được gửi đến email của bạn.');
          setDemoToken('MOCK-RESET-123');
          return;
        }
      }
      setServerError(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Không thể kết nối đến máy chủ API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-20 flex justify-center">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-500">Quên Mật Khẩu</h2>
          <p className="text-xs text-gray-400 mt-1">Nhập email để nhận mã khôi phục tài khoản</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100">
            {serverError}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl border border-green-100 space-y-2">
            <div>{message}</div>
            {demoToken && (
              <div className="bg-white p-2 rounded border border-green-200 mt-2 font-mono text-center">
                Mã xác nhận (Testing): <span className="font-bold text-lg text-primary-500">{demoToken}</span>
              </div>
            )}
            <button
              onClick={() => router.push(`/reset-password?token=${demoToken || ''}`)}
              className="w-full mt-2 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Tiến hành Đặt lại mật khẩu
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Email tài khoản</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email không được để trống',
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Email không đúng định dạng'
                }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="nhapmail@gmail.com"
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1 block">{errors.email.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang gửi yêu cầu...' : 'Gửi mã khôi phục'}
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-gray-500 border-t pt-4">
          <a href="/login" className="text-primary-500 font-bold hover:underline">
            Quay lại Đăng nhập
          </a>
        </div>
      </Card>
    </Container>
  );
}
