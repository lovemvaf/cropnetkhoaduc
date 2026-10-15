'use client';

import React, { useState } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';

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
      setServerError(
        err.response?.data?.error?.message ||
        (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
        'Không thể kết nối đến máy chủ API để gửi mã khôi phục.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border border-[#E2E5DC] rounded-xl p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block font-serif font-bold text-xl text-[#2C4939] tracking-tight">
            CropNet Đồng Nai
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#253129]">Quên Mật Khẩu</h1>
          <p className="text-xs text-[#647067]">Nhập email đã đăng ký để nhận mã khôi phục</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        {message && (
          <div className="bg-[#F1EFE8] text-[#253129] text-xs p-4 rounded-lg border border-[#E2E5DC] space-y-2">
            <div>{message}</div>
            {demoToken && (
              <div className="bg-white p-2.5 rounded-lg border border-[#E2E5DC] mt-2 font-mono text-center">
                Mã xác nhận thử nghiệm: <span className="font-bold text-sm text-[#2C4939]">{demoToken}</span>
              </div>
            )}
            <button
              onClick={() => router.push(`/reset-password?token=${demoToken || ''}`)}
              className="w-full mt-2 py-2.5 bg-[#2C4939] text-white text-xs font-medium rounded-lg hover:bg-[#233C2F] transition-colors"
            >
              Tiến hành Đặt lại mật khẩu
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Email tài khoản</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email không được để trống',
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Email không đúng định dạng'
                }
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="nhapmail@gmail.com"
            />
            {errors.email && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.email.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] transition-colors flex items-center justify-center"
          >
            {loading ? 'Đang gửi yêu cầu...' : 'Gửi mã khôi phục'}
          </button>
        </form>

        <div className="text-center text-xs text-[#647067] border-t border-[#E2E5DC] pt-4">
          <Link href="/login" className="text-[#2C4939] font-medium hover:underline">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
