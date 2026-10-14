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
    <div className="py-20 flex justify-center items-center bg-[#FAF9F5] min-h-[80vh] px-4">
      <div className="max-w-md w-full border border-[#E2E5DC] p-8 space-y-6 shadow-sm bg-white text-center rounded-xl">
        {/* Clock Icon */}
        <div className="w-16 h-16 bg-[#FAF9F5] text-[#A46C49] rounded-full flex items-center justify-center mx-auto border border-[#E2E5DC]">
          <Clock className="w-8 h-8" />
        </div>

        {/* Message Content */}
        <div className="space-y-3">
          <h1 className="font-serif font-bold text-2xl text-[#253129]">Hồ Sơ Chờ Phê Duyệt</h1>
          <p className="text-xs text-[#647067] leading-relaxed">
            Cảm ơn <strong>{user?.fullName || 'bạn'}</strong> đã gửi hồ sơ đăng ký tham gia chuỗi cung ứng CropNet với vai trò{' '}
            <span className="font-medium text-[#2C4939]">
              {user?.role === 'FARMER'
                ? 'Nhà Vườn / Hợp Tác Xã'
                : user?.role === 'LOGISTICS'
                ? 'Đơn Vị Vận Chuyển'
                : user?.role === 'INSPECTOR'
                ? 'Kiểm Định Viên OCOP'
                : 'Thành viên'}
            </span>.
          </p>
          <p className="text-xs text-[#647067] leading-relaxed bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E2E5DC]">
            Hồ sơ năng lực, mã số vùng trồng và quy trình kiểm định của bạn đang được Ban Kiểm Soát rà soát đối chiếu thực địa. Kết quả sẽ được thông báo trong vòng 24 giờ làm việc.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#2C4939] hover:bg-[#233C2F] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Trang chủ</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full border border-[#E2E5DC] bg-white hover:bg-[#FAF9F5] text-[#253129] font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}
