'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordInputs {
  email: string;
}

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInputs>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onSubmit = async (data: ForgotPasswordInputs) => {
    if (loading || cooldown > 0) return;
    setLoading(true);
    setServerError(null);
    setMessage(null);

    try {
      const res = await apiClient.post('/auth/forgot-password', {
        email: data.email.trim()
      });

      if (res.data.success) {
        setMessage(
          res.data.message ||
          'Nếu email tồn tại trong hệ thống, liên kết khôi phục mật khẩu đã được gửi đến hòm thư của bạn.'
        );
        setCooldown(60); // 60s cooldown
      } else {
        setServerError(res.data.error || 'Yêu cầu không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        'Không thể kết nối đến máy chủ để gửi yêu cầu khôi phục.'
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
          <h1 className="text-xl font-serif font-bold text-[#253129]">Quên Mật Khẩu</h1>
          <p className="text-xs text-[#647067]">Nhập email đã đăng ký để nhận liên kết khôi phục</p>
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

        {message && (
          <div
            role="status"
            className="bg-green-50 text-[#2C4939] text-xs p-4 rounded-lg border border-[#C7D1C3] space-y-2 animate-fadeIn"
          >
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2C4939]" />
              <div className="leading-relaxed font-medium">{message}</div>
            </div>
            <p className="text-[#647067] text-[11px] pl-6.5">
              Vui lòng kiểm tra cả mục Thư rác (Spam/Junk) nếu chưa thấy email trong Hộp thư đến.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-medium text-[#253129] mb-1">
              Email tài khoản
            </label>
            <input
              id="forgot-email"
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

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : cooldown > 0 ? (
              `Vui lòng chờ (${cooldown}s)`
            ) : (
              'Gửi Liên Kết Khôi Phục'
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
