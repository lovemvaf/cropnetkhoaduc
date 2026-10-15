'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';

function VerifyEmailForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resentToken, setResentToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle automatic verification if token is present in search queries
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setValue('token', token);
      autoVerify(token);
    }
  }, [searchParams, setValue]);

  const autoVerify = async (token: string) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await apiClient.post('/auth/verify-email', { token });
      if (res.data.success) {
        setSuccess(true);
        alert('Xác minh email thành công!');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Xác minh thất bại');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Không thể xác minh tự động');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null);
    setMessage(null);
    try {
      const res = await apiClient.post('/auth/verify-email', {
        token: data.token
      });

      if (res.data.success) {
        setSuccess(true);
        alert('Xác minh email thành công!');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Xác minh thất bại');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error?.message ||
        (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) ||
        'Mã xác minh không hợp lệ hoặc máy chủ không thể kết nối.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = prompt('Vui lòng nhập Email của bạn để nhận mã xác minh mới:');
    if (!email) return;

    setResending(true);
    setServerError(null);
    setMessage(null);
    setResentToken(null);
    try {
      const res = await apiClient.post('/auth/send-verification', { email });
      if (res.data.success) {
        setMessage('Mã xác minh mới đã được gửi thành công!');
        if (res.data.data && res.data.data.verificationToken) {
          setResentToken(res.data.data.verificationToken);
        }
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Không thể gửi mã xác minh');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Lỗi gửi lại mã xác minh');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border border-[#E2E5DC] rounded-xl p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block font-serif font-bold text-xl text-[#2C4939] tracking-tight">
            CropNet Đồng Nai
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#253129]">Xác Minh Email</h1>
          <p className="text-xs text-[#647067]">Xác thực tài khoản tham gia sàn nông sản CropNet</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-xs p-3.5 rounded-lg border border-green-200">
            Xác minh email thành công! Đang chuyển hướng về trang Đăng nhập...
          </div>
        )}

        {message && (
          <div className="bg-[#F1EFE8] text-[#253129] text-xs p-4 rounded-lg border border-[#E2E5DC] space-y-2">
            <div>{message}</div>
            {resentToken && (
              <div className="bg-white p-2.5 rounded-lg border border-[#E2E5DC] mt-2 font-mono text-center">
                Mã xác nhận (Testing): <span className="font-bold text-sm text-[#2C4939]">{resentToken}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Mã xác minh tài khoản</label>
            <input
              type="text"
              {...register('token', {
                required: 'Mã xác minh không được để trống'
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] font-mono text-center uppercase tracking-widest transition-colors"
              placeholder="MÃ XÁC MINH"
            />
            {errors.token && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.token.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác minh...' : 'Xác thực tài khoản'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 text-xs border-t border-[#E2E5DC] pt-4">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-[#2C4939] hover:underline font-medium"
          >
            {resending ? 'Đang gửi lại...' : 'Chưa nhận được mã? Gửi lại mã xác minh'}
          </button>
          
          <Link href="/login" className="text-[#647067] hover:underline font-medium mt-1">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FAF9F5] min-h-[85vh] flex items-center justify-center py-20">
        <div className="w-full max-w-md p-6 text-center text-[#647067] text-xs">
          Đang tải thông tin xác minh...
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
