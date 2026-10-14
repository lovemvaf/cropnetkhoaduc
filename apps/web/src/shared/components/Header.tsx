'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/shared/stores/cart';
import { useAuthStore } from '@/shared/stores/auth';
import { ShoppingBag, User, Sprout, LogOut, LayoutDashboard, Sparkles, MapPin, Calendar, QrCode } from 'lucide-react';
import { ConfirmDialog } from '@cropnet/ui';

export default function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* DiGiFest 2026 Showcase Mode Notice */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white text-[11px] md:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase">DIGIFEST 2026</span>
        <span className="truncate">Bản Trình Diễn Dự Thi AI Digital Business Challenge — Nông Sản Số Thành Phố Đồng Nai</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary-600 font-bold text-lg md:text-xl transition-transform active:scale-95">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-primary-500 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-tight font-black leading-none bg-gradient-to-r from-emerald-700 to-primary-600 bg-clip-text text-transparent">
              CROPNET <span className="text-amber-500 font-extrabold text-xs">ĐỒNG NAI AI</span>
            </span>
            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
              Nông Sản Số • DIGIFEST 2026
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-gray-600">
          <Link 
            href="/products" 
            className={`transition-all duration-200 py-1 border-b-2 ${
              isActive('/products') 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent hover:text-primary-600 text-gray-600'
            }`}
          >
            Nông Sản Đồng Nai
          </Link>
          <Link 
            href="/ban-do" 
            className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1 ${
              isActive('/ban-do') 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent hover:text-primary-600 text-gray-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bản Đồ Vườn</span>
          </Link>
          <Link 
            href="/mua-vu" 
            className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1 ${
              isActive('/mua-vu') 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent hover:text-primary-600 text-gray-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Lịch Mùa Vụ</span>
          </Link>
          <Link 
            href="/ai-tu-van" 
            className={`transition-all duration-200 py-1 px-2.5 rounded-full border flex items-center gap-1.5 shadow-xs ${
              isActive('/ai-tu-van') 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>AI Tư Vấn</span>
            <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full uppercase">24/7</span>
          </Link>
          <Link 
            href="/traceability" 
            className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1 ${
              isActive('/traceability') 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent hover:text-primary-600 text-gray-600'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Truy Xuất QR</span>
          </Link>
          <Link 
            href="/forum" 
            className={`transition-all duration-200 py-1 border-b-2 ${
              isActive('/forum') 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent hover:text-primary-600 text-gray-600'
            }`}
          >
            Cộng Đồng
          </Link>
          {mounted && isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link 
              href="/dashboard/customer" 
              className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1.5 ${
                isActive('/dashboard/customer') 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent hover:text-primary-500 text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Đơn Hàng Của Tôi</span>
            </Link>
          )}
          {mounted && isAuthenticated && user?.role === 'FARMER' && (
            <Link 
              href="/dashboard/supplier" 
              className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1.5 ${
                isActive('/dashboard/supplier') 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent hover:text-primary-500 text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kênh Nhà Vườn</span>
            </Link>
          )}
          {mounted && isAuthenticated && user?.role === 'ADMIN' && (
            <Link 
              href="/admin" 
              className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1.5 ${
                isActive('/admin') 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent hover:text-primary-500 text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kênh Admin</span>
            </Link>
          )}
          {mounted && isAuthenticated && user?.role === 'LOGISTICS' && (
            <Link 
              href="/dashboard/logistics" 
              className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1.5 ${
                isActive('/dashboard/logistics') 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent hover:text-primary-500 text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kênh Vận Chuyển</span>
            </Link>
          )}
          {mounted && isAuthenticated && user?.role === 'INSPECTOR' && (
            <Link 
              href="/dashboard/inspector" 
              className={`transition-all duration-200 py-1 border-b-2 flex items-center gap-1.5 ${
                isActive('/dashboard/inspector') 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent hover:text-primary-500 text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kênh Kiểm Định</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {mounted && (!isAuthenticated || user?.role === 'CUSTOMER') && (
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-500 transition-all hover:scale-105 duration-200">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Chào, {user?.fullName}</span>
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="flex items-center gap-1 bg-red-50 text-red-500 px-4 py-2 rounded-full font-bold hover:bg-red-100 transition-colors text-xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 bg-primary-50 text-primary-500 px-4 py-2 rounded-full font-bold hover:bg-primary-100 transition-all hover:scale-105 active:scale-95">
              <User className="w-4 h-4" />
              <span className="text-xs">Đăng Nhập</span>
            </Link>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmLabel="Đăng xuất"
        variant="danger"
      />
    </header>
  );
}
