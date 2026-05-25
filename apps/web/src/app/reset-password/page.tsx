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
      if (err.code === 'ERR_NETWORK') {
        if (data.token === 'MOCK-RESET-123') {
          setSuccess(true);
          alert('Cập nhật mật khẩu thành công (Mock Mode)');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
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
          <h2 className="text-2xl font-bold text-primary-500">Đặt Lại Mật Khẩu</h2>
          <p className="text-xs text-gray-400 mt-1">Thiết lập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100">
            {serverError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl border border-green-100">
            Cập nhật mật khẩu thành công! Đang chuyển hướng về trang Đăng nhập...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Mã khôi phục</label>
            <input
              type="text"
              {...register('token', {
                required: 'Mã khôi phục không được để trống'
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm font-mono text-center uppercase tracking-widest"
              placeholder="MÃ KHÔI PHỤC"
            />
            {errors.token && (
              <span className="text-red-500 text-xs mt-1 block">{errors.token.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Mật khẩu mới</label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu mới không được để trống',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 block">{errors.password.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Xác nhận mật khẩu không được để trống',
                validate: value => value === password || 'Mật khẩu xác nhận không khớp'
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-gray-500 border-t pt-4">
          <Link href="/login" className="text-primary-500 font-bold hover:underline">
            Quay lại Đăng nhập
          </Link>
        </div>
      </Card>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container className="py-20 flex justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="text-gray-400">Đang tải...</div>
        </Card>
      </Container>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
