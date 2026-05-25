'use client';

import React from 'react';
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'next/navigation';
import { Card, Container } from '@cropnet/ui';
import { Clock, LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    alert('Đã đăng xuất thành công!');
    router.push('/login');
  };

  return (
    <Container className="py-20 flex justify-center items-center bg-gray-50 min-h-[80vh]">
      <Card className="max-w-md w-full border-t-8 border-amber-500 p-8 space-y-6 shadow-xl bg-white text-center">
        {/* Animated Clock Icon */}
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-10 h-10" />
        </div>

        {/* Message Content */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-2xl text-gray-900">Đang Chờ Phê Duyệt</h3>
          <p className="text-sm text-gray-500 leading-relaxed px-2">
            Cảm ơn <strong>{user?.fullName || 'bạn'}</strong> đã đăng ký gia nhập CropNet với vai trò{' '}
            <span className="font-bold text-amber-600">
              {user?.role === 'FARMER'
                ? 'Nhà Vườn / Supplier'
                : user?.role === 'LOGISTICS'
                ? 'Đối Tác Vận Chuyển'
                : user?.role === 'INSPECTOR'
                ? 'Kiểm Định Viên'
                : 'Thành viên'}
            </span>.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
            Hồ sơ, giấy phép vùng trồng và thông tin của bạn đã được gửi tới Ban Quản Trị CropNet. Hệ thống đang tiến hành rà soát thủ công để đảm bảo chất lượng. Kết quả phê duyệt sẽ có trong vòng 24 giờ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang chủ</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            <span>Đăng nhập tài khoản khác</span>
          </button>
        </div>
      </Card>
    </Container>
  );
}
