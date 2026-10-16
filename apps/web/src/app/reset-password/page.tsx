'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ResetPasswordInputs {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordInputs>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();
  const password = watch('password');

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (loading) return;
    setLoading(true);
    setServerError(null);

    try {
      const res = await apiClient.post('/auth/reset-password', {
        password: data.password
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setServerError(res.data.error || 'Đặt lại mật khẩu không thành công.');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        'Phiên khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white border border-[#E2E5DC] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block font-serif font-bold text-xl text-[#2C4939] tracking-tight">
            CropNet Đồng Nai
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#253129]">Thiết Lập Mật Khẩu Mới</h1>
          <p className="text-xs text-[#647067]">Nhập mật khẩu mới an toàn cho tài khoản của bạn</p>
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

        {success && (
          <div
            role="status"
            className="bg-green-50 text-[#2C4939] text-xs p-3.5 rounded-lg border border-[#C7D1C3] flex items-center gap-2.5 animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2C4939]" />
            <span>Cập nhật mật khẩu thành công! Đang chuyển hướng về trang Đăng nhập...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reset-password" className="block text-xs font-medium text-[#253129] mb-1">
              Mật khẩu mới *
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                {...register('password', {
                  required: 'Mật khẩu mới không được để trống',
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

          <div>
            <label htmlFor="reset-confirmPassword" className="block text-xs font-medium text-[#253129] mb-1">
              Xác nhận mật khẩu mới *
            </label>
            <div className="relative">
              <input
                id="reset-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                {...register('confirmPassword', {
                  required: 'Xác nhận mật khẩu không được để trống',
                  validate: value => value === password || 'Mật khẩu xác nhận không khớp'
                })}
                className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 pr-10 rounded-lg focus:outline-none text-xs text-[#253129] transition-colors ${
                  errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C978F] hover:text-[#253129] transition-colors p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang cập nhật mật khẩu...</span>
              </>
            ) : (
              'Cập Nhật Mật Khẩu'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#647067] border-t border-[#E2E5DC] pt-4">
          <Link href="/login" className="text-[#2C4939] font-medium hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF9F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-20">
          <div className="w-full max-w-md p-6 text-center text-[#647067] text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2C4939]" />
            <span>Đang tải...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
