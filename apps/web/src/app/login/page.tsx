'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const onSubmit = async (data: LoginFormInputs) => {
    if (loading) return; // Prevent double submit
    setLoading(true);
    setServerError(null);

    try {
      const res = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
        rememberMe: !!data.rememberMe
      });

      if (res.data.success && res.data.data?.user) {
        const user = res.data.data.user;
        login(user);
        setLoginSuccess(true);

        setTimeout(() => {
          if (user.role === 'ADMIN') router.push('/admin');
          else if (user.role === 'FARMER') router.push('/dashboard/supplier');
          else if (user.role === 'LOGISTICS') router.push('/dashboard/logistics');
          else if (user.role === 'INSPECTOR') router.push('/dashboard/inspector');
          else router.push('/dashboard/customer');
        }, 800);
      } else {
        setServerError(res.data.error || 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        'Email hoặc mật khẩu không chính xác hoặc không thể kết nối đến máy chủ.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white border border-[#E2E5DC] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block font-serif font-bold text-xl text-[#2C4939] tracking-tight">
            CropNet Đồng Nai
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#253129]">Đăng Nhập Hệ Thống</h1>
          <p className="text-xs text-[#647067]">Thương mại nông sản số & Truy xuất nguồn gốc</p>
        </div>

        {/* Feedback Alerts */}
        {serverError && (
          <div
            role="alert"
            className="bg-red-50 text-red-700 text-xs p-3.5 rounded-lg border border-red-200 flex items-start gap-2.5 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="leading-relaxed">{serverError}</div>
          </div>
        )}

        {loginSuccess && (
          <div
            role="status"
            className="bg-green-50 text-[#2C4939] text-xs p-3.5 rounded-lg border border-[#C7D1C3] flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2C4939]" />
            <span>Đăng nhập thành công! Đang chuyển hướng về trang làm việc...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-[#253129] mb-1">
              Email đăng nhập
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email', {
                required: 'Email không được để trống',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Email không đúng định dạng hợp lệ'
                }
              })}
              className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 rounded-lg focus:outline-none text-xs text-[#253129] transition-colors ${
                errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
              }`}
              placeholder="nhapmail@gmail.com"
            />
            {errors.email && (
              <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="block text-xs font-medium text-[#253129]">
                Mật khẩu
              </label>
              {capsLockActive && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Caps Lock đang bật
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                onKeyDown={handleKeyDown}
                {...register('password', {
                  required: 'Mật khẩu không được để trống',
                  minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                })}
                className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 pr-10 rounded-lg focus:outline-none text-xs text-[#253129] transition-colors ${
                  errors.password ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C978F] hover:text-[#253129] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                {errors.password.message}
              </span>
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
            disabled={loading || loginSuccess}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực tài khoản...</span>
              </>
            ) : (
              'Đăng Nhập'
            )}
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
