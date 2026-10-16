'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterFormInputs {
  fullName: string;
  email: string;
  phone: string;
  roleName: 'CUSTOMER' | 'FARMER';
  farmName?: string;
  address?: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>({
    defaultValues: {
      roleName: 'CUSTOMER'
    }
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const router = useRouter();
  const roleValue = watch('roleName');
  const passwordValue = watch('password');
  const isFarmer = roleValue === 'FARMER';

  const onSubmit = async (data: RegisterFormInputs) => {
    if (loading) return; // Prevent double submit
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
        setRegisterSuccess(
          res.data.message ||
          'Đăng ký tài khoản thành công! Vui lòng kiểm tra hộp thư email để xác minh trước khi đăng nhập.'
        );

        setTimeout(() => {
          router.push('/login');
        }, 2500);
      } else {
        setServerError(res.data.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.error ||
        'Không thể kết nối đến máy chủ để tạo tài khoản. Vui lòng kiểm tra kết nối mạng và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white border border-[#E2E5DC] rounded-xl p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block font-serif font-bold text-xl text-[#2C4939] tracking-tight">
            CropNet Đồng Nai
          </Link>
          <h1 className="text-xl font-serif font-bold text-[#253129]">Đăng Ký Tài Khoản</h1>
          <p className="text-xs text-[#647067]">Gia nhập chuỗi cung ứng nông sản an toàn Đồng Nai</p>
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

        {registerSuccess && (
          <div
            role="status"
            className="bg-green-50 text-[#2C4939] text-xs p-3.5 rounded-lg border border-[#C7D1C3] flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2C4939]" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-semibold">{registerSuccess}</div>
              <div className="text-[#647067]">Đang chuyển hướng về trang Đăng nhập trong giây lát...</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-fullName" className="block text-xs font-medium text-[#253129] mb-1">
              Họ và tên *
            </label>
            <input
              id="reg-fullName"
              type="text"
              autoComplete="name"
              aria-required="true"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              {...register('fullName', {
                required: 'Họ và tên không được để trống',
                minLength: { value: 2, message: 'Họ và tên quá ngắn' }
              })}
              className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 rounded-lg focus:outline-none text-xs text-[#253129] transition-colors ${
                errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
              }`}
              placeholder="Nguyễn Văn An"
            />
            {errors.fullName && (
              <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                {errors.fullName.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-[#253129] mb-1">
              Email đăng ký *
            </label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-phone" className="block text-xs font-medium text-[#253129] mb-1">
              Số điện thoại *
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              aria-required="true"
              aria-invalid={errors.phone ? 'true' : 'false'}
              {...register('phone', {
                required: 'Số điện thoại không được để trống',
                pattern: {
                  value: /^[0-9+() -]{9,15}$/,
                  message: 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)'
                }
              })}
              className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 rounded-lg focus:outline-none text-xs text-[#253129] font-mono transition-colors ${
                errors.phone ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
              }`}
              placeholder="0987654321"
            />
            {errors.phone && (
              <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                {errors.phone.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="reg-roleName" className="block text-xs font-medium text-[#253129] mb-1">
              Vai trò tham gia
            </label>
            <select
              id="reg-roleName"
              {...register('roleName', { required: true })}
              className="w-full bg-[#FAF9F5] border border-[#E2E5DC] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#2C4939] focus:bg-white text-xs text-[#253129] transition-colors"
            >
              <option value="CUSTOMER">Người tiêu dùng (Khách hàng lẻ & Bếp ăn)</option>
              <option value="FARMER">Nhà vườn / Hợp tác xã (Đăng ký xét duyệt)</option>
            </select>
          </div>

          {isFarmer && (
            <div className="space-y-4 border-t border-[#E2E5DC] pt-4 animate-fadeIn">
              <div>
                <label htmlFor="reg-farmName" className="block text-xs font-medium text-[#253129] mb-1">
                  Tên Nông Trại / Hợp Tác Xã *
                </label>
                <input
                  id="reg-farmName"
                  type="text"
                  aria-required="true"
                  aria-invalid={errors.farmName ? 'true' : 'false'}
                  {...register('farmName', {
                    required: isFarmer ? 'Vui lòng cung cấp Tên Nông Trại / HTX' : false
                  })}
                  className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 rounded-lg focus:outline-none text-xs text-[#253129] transition-colors ${
                    errors.farmName ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
                  }`}
                  placeholder="HTX Nông Nghiệp Tân Triều"
                />
                {errors.farmName && (
                  <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                    {errors.farmName.message}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="reg-address" className="block text-xs font-medium text-[#253129] mb-1">
                  Địa chỉ vùng canh tác tại Đồng Nai *
                </label>
                <input
                  id="reg-address"
                  type="text"
                  aria-required="true"
                  aria-invalid={errors.address ? 'true' : 'false'}
                  {...register('address', {
                    required: isFarmer ? 'Vui lòng cung cấp Địa chỉ vùng canh tác' : false
                  })}
                  className={`w-full bg-[#FAF9F5] border px-3.5 py-2.5 rounded-lg focus:outline-none text-xs text-[#253129] transition-colors ${
                    errors.address ? 'border-red-400 focus:border-red-500' : 'border-[#E2E5DC] focus:border-[#2C4939] focus:bg-white'
                  }`}
                  placeholder="Xã Tân Bình, huyện Vĩnh Cửu, tỉnh Đồng Nai"
                />
                {errors.address && (
                  <span role="alert" className="text-red-500 text-[11px] mt-1 block">
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-[#253129] mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
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

          <div>
            <label htmlFor="reg-confirmPassword" className="block text-xs font-medium text-[#253129] mb-1">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <input
                id="reg-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                {...register('confirmPassword', {
                  required: 'Xác nhận mật khẩu không được để trống',
                  validate: value => value === passwordValue || 'Mật khẩu xác nhận không khớp'
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
            disabled={loading || !!registerSuccess}
            className="w-full py-3 bg-[#2C4939] text-white font-medium text-xs rounded-lg hover:bg-[#233C2F] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              'Đăng Ký Tài Khoản'
            )}
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
