'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';

function ResetPasswordForm() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setValue('token', token);
    }
  }, [searchParams, setValue]);

  const password = watch('password');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await apiClient.post('/auth/reset-password', {
        token: data.token,
        password: data.password
      });

      if (res.data.success) {
        setSuccess(true);
        alert('Mật khẩu của bạn đã được cập nhật thành công!');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error?.message ||
        (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
        'Không thể kết nối đến máy chủ API để đặt lại mật khẩu.'
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
          <h1 className="text-xl font-serif font-bold text-[#253129]">Đặt Lại Mật Khẩu</h1>
          <p className="text-xs text-[#647067]">Thiết lập mật khẩu mới bảo mật cho tài khoản</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-xs p-3.5 rounded-lg border border-green-200">
            Cập nhật mật khẩu thành công! Đang chuyển hướng về trang Đăng nhập...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Mã xác nhận khôi phục</label>
            <input
              type="text"
              {...register('token', {
                required: 'Mã khôi phục không được để trống'
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] font-mono text-center uppercase tracking-widest transition-colors"
              placeholder="MÃ KHÔI PHỤC"
            />
            {errors.token && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.token.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Mật khẩu mới</label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu mới không được để trống',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.password.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Xác nhận mật khẩu không được để trống',
                validate: value => value === password || 'Mật khẩu xác nhận không khớp'
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.confirmPassword.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FAF9F5] min-h-[85vh] flex items-center justify-center py-20">
        <div className="w-full max-w-md p-6 text-center text-[#647067] text-xs">
          Đang tải thông tin...
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
