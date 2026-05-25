'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/shared/services/api';

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
      if (err.code === 'ERR_NETWORK') {
        if (data.token === 'MOCK-VERIFY-123') {
          setSuccess(true);
          alert('Xác minh email thành công (Mock Mode)');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }
      }
      setServerError(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Mã xác minh không hợp lệ hoặc lỗi máy chủ');
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
    <Container className="py-20 flex justify-center">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-500">Xác Minh Email</h2>
          <p className="text-xs text-gray-400 mt-1">Xác thực tài khoản để bắt đầu sử dụng đầy đủ chức năng</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100">
            {serverError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl border border-green-100">
            Xác minh email thành công! Đang chuyển hướng về trang Đăng nhập...
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl border border-green-100 space-y-2">
            <div>{message}</div>
            {resentToken && (
              <div className="bg-white p-2 rounded border border-green-200 mt-2 font-mono text-center">
                Mã xác nhận của bạn (Testing): <span className="font-bold text-lg text-primary-500">{resentToken}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Mã xác minh</label>
            <input
              type="text"
              {...register('token', {
                required: 'Mã xác minh không được để trống'
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm font-mono text-center uppercase tracking-widest"
              placeholder="MÃ XÁC MINH"
            />
            {errors.token && (
              <span className="text-red-500 text-xs mt-1 block">{errors.token.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác minh...' : 'Xác thực tài khoản'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 text-xs border-t pt-4">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary-500 hover:underline font-semibold"
          >
            {resending ? 'Đang gửi lại...' : 'Chưa nhận được mã? Gửi lại mã xác minh'}
          </button>
          
          <a href="/login" className="text-gray-400 hover:underline font-medium mt-1">
            Quay lại Đăng nhập
          </a>
        </div>
      </Card>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Container className="py-20 flex justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="text-gray-400">Đang tải...</div>
        </Card>
      </Container>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
