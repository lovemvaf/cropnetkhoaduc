'use client';

import React, { useState } from 'react';
import { Card, Container } from '@cropnet/ui';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';

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
    <Container className="py-20 flex justify-center">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-500">Đăng Ký Tài Khoản</h2>
          <p className="text-xs text-gray-400 mt-1">Gia nhập cộng đồng nông sản sạch D2C</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Họ và tên</label>
            <input
              type="text"
              {...register('fullName', { required: 'Họ tên không được để trống' })}
              className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <span className="text-red-500 text-xs mt-1 block">{errors.fullName.message as string}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email không được để trống',
                pattern: { value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: 'Email không đúng định dạng' }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="nhapmail@gmail.com"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message as string}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Số điện thoại</label>
            <input
              type="text"
              {...register('phone', {
                required: 'Số điện thoại không được để trống',
                pattern: { value: /^[0-9]{10}$/, message: 'Số điện thoại phải gồm 10 chữ số' }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="0987654321"
            />
            {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message as string}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Vai trò tham gia</label>
            <select
              {...register('roleName', { required: true })}
              className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm bg-white"
            >
              <option value="CUSTOMER">Người tiêu dùng sạch (Customer)</option>
              <option value="FARMER">Nông dân / Hợp tác xã (Supplier)</option>
              <option value="LOGISTICS">Đơn vị vận chuyển (Logistics)</option>
              <option value="INSPECTOR">Kiểm định viên chất lượng (Inspector)</option>
            </select>
          </div>

          {isFarmer && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Tên Nông Trại / HTX</label>
                <input
                  type="text"
                  {...register('farmName', { required: 'Tên nông trại không được để trống' })}
                  className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm"
                  placeholder="HTX Trái Cây Sạch Cái Mơn"
                />
                {errors.farmName && <span className="text-red-500 text-xs mt-1 block">{errors.farmName.message as string}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Địa chỉ vùng trồng</label>
                <input
                  type="text"
                  {...register('address', { required: 'Địa chỉ không được để trống' })}
                  className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm"
                  placeholder="Chợ Lách, Bến Tre"
                />
                {errors.address && <span className="text-red-500 text-xs mt-1 block">{errors.address.message as string}</span>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Mật khẩu</label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu không được để trống',
                minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              })}
              className="mt-1 w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:outline-primary-500 text-sm"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message as string}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors flex items-center justify-center"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>
      </Card>
    </Container>
  );
}
