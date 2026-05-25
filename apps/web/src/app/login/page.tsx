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
      // Smart offline fallback for frontend-only testing using DB seeds credentials
      if (err.code === 'ERR_NETWORK' || !err.response) {
        if (data.email === 'admin@cropnet.vn' && data.password === '123456') {
          login('mock-token-admin', { id: 'admin-123', email: data.email, fullName: 'Cộng Tác Viên CropNet', role: 'ADMIN', status: 'ACTIVE', supplierStatus: null });
          router.push('/admin');
          return;
        } else if (data.email === 'farmer@nongnghiep.vn' && data.password === '123456') {
          login('mock-token-farmer', { id: 'farmer-123', email: data.email, fullName: 'Chú Út Miền Tây', role: 'FARMER', status: 'ACTIVE', supplierId: 'sup-123', supplierStatus: 'APPROVED' });
          router.push('/dashboard/supplier');
          return;
        } else if (data.email === 'khachhang@gmail.com' && data.password === '123456') {
          login('mock-token-customer', { id: 'cust-123', email: data.email, fullName: 'Trần Thị Hà Nội', role: 'CUSTOMER', status: 'ACTIVE', supplierStatus: null });
          router.push('/');
          return;
        } else if (data.email === 'logistics@cropnet.vn' && data.password === '123456') {
          login('mock-token-logistics', { id: 'logistics-123', email: data.email, fullName: 'Vận Chuyển CropNet', role: 'LOGISTICS', status: 'ACTIVE', supplierStatus: null });
          router.push('/dashboard/logistics');
          return;
        } else if (data.email === 'inspector@cropnet.vn' && data.password === '123456') {
          login('mock-token-inspector', { id: 'inspector-123', email: data.email, fullName: 'Trạm Kiểm Định CropNet', role: 'INSPECTOR', status: 'ACTIVE', supplierStatus: null });
          router.push('/dashboard/inspector');
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
          <h2 className="text-2xl font-bold text-primary-500">Đăng Nhập CropNet</h2>
          <p className="text-xs text-gray-400 mt-1">Kết nối trực tiếp nông sản sạch Việt Nam</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email không được để trống',
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Email không đúng định dạng'
                }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="nhapmail@gmail.com"
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1 block">{errors.email.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Mật khẩu</label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu không được để trống',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-3 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 block">{errors.password.message as string}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs my-2">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500 font-medium select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4 border-gray-300"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              href="/forgot-password"
              className="text-primary-500 hover:underline font-semibold"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-gray-500 border-t pt-4">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-primary-500 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </Container>
  );
}
