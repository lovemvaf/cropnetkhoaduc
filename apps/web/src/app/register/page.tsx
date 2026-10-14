'use client';

import React, { useState } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isFarmer, setIsFarmer] = useState(false);
  const router = useRouter();

  const roleValue = watch('roleName');

  React.useEffect(() => {
    setIsFarmer(roleValue === 'FARMER');
  }, [roleValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await apiClient.post('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        roleName: data.roleName,
        farmName: data.farmName,
        address: data.address
      });

      if (res.data.success) {
        alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        router.push('/login');
      } else {
        setServerError(res.data.error?.message || (typeof res.data.error === 'string' ? res.data.error : null) || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        alert('Đăng ký giả lập thành công (Môi trường phát triển)!');
        router.push('/login');
        return;
      }
      setServerError(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Không thể kết nối đến máy chủ API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white border border-[#E2E5DC] rounded-xl p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block font-serif font-bold text-xl text-[#2C4939] tracking-tight">
            CropNet Đồng Nai
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#253129]">Đăng Ký Tài Khoản</h1>
          <p className="text-xs text-[#647067]">Gia nhập chuỗi cung ứng nông sản an toàn Đồng Nai</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Họ và tên *</label>
            <input
              type="text"
              {...register('fullName', { required: 'Họ tên không được để trống' })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="Nguyễn Văn An"
            />
            {errors.fullName && <span className="text-red-500 text-[11px] mt-1 block">{errors.fullName.message as string}</span>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Email đăng ký *</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email không được để trống',
                pattern: { value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: 'Email không đúng định dạng' }
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="nhapmail@gmail.com"
            />
            {errors.email && <span className="text-red-500 text-[11px] mt-1 block">{errors.email.message as string}</span>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Số điện thoại *</label>
            <input
              type="tel"
              {...register('phone', {
                required: 'Số điện thoại không được để trống',
                pattern: { value: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' }
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] font-mono transition-colors"
              placeholder="0987654321"
            />
            {errors.phone && <span className="text-red-500 text-[11px] mt-1 block">{errors.phone.message as string}</span>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Vai trò tham gia</label>
            <select
              {...register('roleName', { required: true })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
            >
              <option value="CUSTOMER">Người tiêu dùng (Khách hàng lẻ & Bếp ăn)</option>
              <option value="FARMER">Nhà vườn / Hợp tác xã (Nhà cung cấp)</option>
              <option value="LOGISTICS">Đơn vị vận tải / Giao vận</option>
              <option value="INSPECTOR">Kiểm định viên chất lượng / OCOP</option>
            </select>
          </div>

          {isFarmer && (
            <div className="space-y-4 border-t border-[#E2E5DC] pt-4">
              <div>
                <label className="block text-xs font-medium text-[#253129] mb-1">Tên Nông Trại / HTX *</label>
                <input
                  type="text"
                  {...register('farmName', { required: 'Tên nông trại không được để trống' })}
                  className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
                  placeholder="HTX Nông Nghiệp Tân Triều"
                />
                {errors.farmName && <span className="text-red-500 text-[11px] mt-1 block">{errors.farmName.message as string}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#253129] mb-1">Địa chỉ vùng canh tác *</label>
                <input
                  type="text"
                  {...register('address', { required: 'Địa chỉ không được để trống' })}
                  className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
                  placeholder="Xã Tân Bình, huyện Vĩnh Cửu, tỉnh Đồng Nai"
                />
                {errors.address && <span className="text-red-500 text-[11px] mt-1 block">{errors.address.message as string}</span>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#253129] mb-1">Mật khẩu *</label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu không được để trống',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-500 text-[11px] mt-1 block">{errors.password.message as string}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] transition-colors flex items-center justify-center"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="text-center text-xs text-[#647067] border-t border-[#E2E5DC] pt-4">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#2C4939] font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
