'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Container, Card } from '@cropnet/ui';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'CUSTOMER' | 'FARMER' | 'LOGISTICS' | 'INSPECTOR')[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const isPending = user && (
    (user.role === 'FARMER' && user.supplierStatus === 'PENDING') ||
    (user.role === 'LOGISTICS' && user.status === 'PENDING') ||
    (user.role === 'INSPECTOR' && user.status === 'PENDING')
  );

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated && isPending) {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      if (pathname !== '/dashboard/pending') {
        router.push('/dashboard/pending');
      }
    }
  }, [mounted, isLoading, isAuthenticated, isPending, router]);

  if (!mounted || isLoading) {
    return (
      <Container className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#C7D1C3] border-t-[#2C4939] rounded-full animate-spin"></div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isPending) {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (pathname !== '/dashboard/pending') {
      return (
        <Container className="py-20 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
        </Container>
      );
    }
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <Container className="py-20 flex justify-center items-center">
        <Card className="max-w-md w-full text-center space-y-6 border-red-100 bg-red-50/10">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-2xl text-gray-900">Không có quyền truy cập</h3>
            <p className="text-sm text-gray-500">
              Tài khoản của bạn ({user.role}) không được phép truy cập trang quản trị này. Vui lòng liên hệ Admin hoặc chuyển đổi tài khoản.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-[#2C4939] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#233C2F] transition-colors flex items-center gap-1.5 text-sm"
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>
          </div>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
}
