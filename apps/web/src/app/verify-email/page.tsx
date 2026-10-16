'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, Mail, KeyRound } from 'lucide-react';

interface VerifyFormInputs {
  email: string;
  token: string;
}

function VerifyEmailForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<VerifyFormInputs>();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [showResendInput, setShowResendInput] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle URL query parameters (auto-fill or link verification)
  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('code');
    const token_hash = searchParams.get('token_hash');
    const email = searchParams.get('email');

    if (email) {
      setValue('email', email);
      setResendEmail(email);
    }

    if (token) {
      setValue('token', token);
      if (email || token_hash) {
        autoVerify(token, email || undefined, token_hash || undefined);
      }
    } else if (token_hash) {
      autoVerify(undefined, undefined, token_hash);
    }
  }, [searchParams, setValue]);

  const autoVerify = async (token?: string, email?: string, token_hash?: string) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await apiClient.post('/auth/verify-email', {
        token,
        email,
        token_hash
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setServerError(res.data.error || 'Xác minh không thành công.');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Mã xác minh không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VerifyFormInputs) => {
    if (loading) return;
    setLoading(true);
    setServerError(null);

    try {
      const res = await apiClient.post('/auth/verify-email', {
        token: data.token.trim(),
        email: data.email.trim()
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setServerError(res.data.error || 'Xác minh thất bại.');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        'Mã xác minh không hợp lệ hoặc máy chủ không thể kết nối.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      setServerError('Vui lòng nhập email hợp lệ để nhận mã xác minh mới.');
      return;
    }

    if (cooldown > 0 || resending) return;

    setResending(true);
    setServerError(null);
    setResendMessage(null);

    try {
      const res = await apiClient.post('/auth/send-verification', {
        email: resendEmail.trim()
      });

      if (res.data.success) {
        setResendMessage(res.data.message || 'Mã xác minh mới đã được gửi vào hòm thư của bạn.');
        setCooldown(60); // 60s cooldown
      } else {
        setServerError(res.data.error || 'Không thể gửi mã xác minh.');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Lỗi gửi lại mã xác minh. Vui lòng thử lại sau.');
    } finally {
      setResending(false);
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
          <h1 className="text-xl font-serif font-bold text-[#253129]">Xác Minh Email</h1>
          <p className="text-xs text-[#647067]">Xác thực tài khoản tham gia sàn nông sản an toàn</p>
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
            className="bg-green-50 text-[#2C4939] text-xs p-3.5 rounded-lg border border-[#C7D1C3] flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2C4939]" />
            <span>Xác minh email thành công! Đang chuyển hướng về trang Đăng nhập...</span>
          </div>
        )}

        {resendMessage && (
          <div
            role="status"
            className="bg-[#F1EFE8] text-[#253129] text-xs p-3.5 rounded-lg border border-[#E2E5DC] flex items-center gap-2.5"
          >
            <Mail className="w-4 h-4 flex-shrink-0 text-[#2C4939]" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="verify-email" className="block text-xs font-medium text-[#253129] mb-1">
              Email tài khoản
            </label>
            <input
              id="verify-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email', {
                required: 'Vui lòng nhập email tài khoản',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Email không đúng định dạng hợp lệ'
                }
              })}
              onChange={(e) => setResendEmail(e.target.value)}
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
            <label htmlFor="verify-token" className="block text-xs font-medium text-[#253129] mb-1">
              Mã xác minh (OTP hoặc Token)
            </label>
            <input
              id="verify-token"
              type="text"
              aria-required="true"
              aria-invalid={errors.token ? 'true' : 'false'}
              {...register('token', {
                required: 'Mã xác minh không được để trống'
              })}
              className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 rounded-lg focus:outline-none text-xs text-[#253129] font-mono text-center tracking-widest uppercase transition-colors ${
                errors.token ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
              }`}
              placeholder="MÃ XÁC MINH"
            />
            {errors.token && (
              <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                {errors.token.message}
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
                <span>Đang xác minh...</span>
              </>
            ) : (
              'Xác Thực Tài Khoản'
            )}
          </button>
        </form>

        {/* Resend Verification Section */}
        <div className="border-t border-[#E2E5DC] pt-4 space-y-3">
          {!showResendInput ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowResendInput(true)}
                className="text-xs text-[#2C4939] hover:underline font-medium"
              >
                Chưa nhận được mã? Nhấn vào đây để gửi lại
              </button>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-2 bg-[#FAF9F5] p-3 rounded-lg border border-[#E2E5DC]">
              <label htmlFor="resend-email" className="block text-[11px] font-medium text-[#253129]">
                Nhập email để nhận mã xác minh mới:
              </label>
              <div className="flex gap-2">
                <input
                  id="resend-email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="nhapmail@gmail.com"
                  className="flex-1 bg-white border border-[#E2E5DC] px-2.5 py-1.5 rounded text-xs text-[#253129] focus:outline-none focus:border-[#2C4939]"
                />
                <button
                  type="submit"
                  disabled={resending || cooldown > 0}
                  className="px-3 py-1.5 bg-[#2C4939] text-white text-xs font-medium rounded hover:bg-[#233C2F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {resending ? 'Đang gửi...' : cooldown > 0 ? `Chờ ${cooldown}s` : 'Gửi lại'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs">
            <Link href="/login" className="text-[#647067] hover:underline">
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF9F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-20">
          <div className="w-full max-w-md p-6 text-center text-[#647067] text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2C4939]" />
            <span>Đang tải thông tin xác minh...</span>
          </div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
