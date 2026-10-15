'use client';

import React, { useState } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null);
    try {
      // API call to Express auth service
      const res = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
        rememberMe: !!data.rememberMe
      });

      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        login(accessToken, user);
        alert('Đăng nhập thành công!');
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'FARMER') router.push('/dashboard/supplier');
        else if (user.role === 'LOGISTICS') router.push('/dashboard/logistics');
        else if (user.role === 'INSPECTOR') router.push('/dashboard/inspector');
        else router.push('/');
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error?.message ||
        (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
        'Không thể kết nối đến máy chủ API hoặc thông tin đăng nhập không chính xác.'
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
          <h1 className="text-xl font-serif font-bold text-[#253129]">Đăng Nhập Hệ Thống</h1>
          <p className="text-xs text-[#647067]">Thương mại nông sản số & Truy xuất nguồn gốc</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Email đăng nhập</label>
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

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Mật khẩu</label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu không được để trống',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.password.message as string}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs my-2">
            <label className="flex items-center gap-2 cursor-pointer text-[#647067] select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="rounded accent-[#2C4939] h-3.5 w-3.5"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              href="/forgot-password"
              className="text-[#2C4939] hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="text-center text-xs text-[#647067] border-t border-[#E2E5DC] pt-4">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-[#2C4939] font-medium hover:underline">
            Đăng ký tham gia
          </Link>
        </div>
      </div>
    </div>
  );
}
