'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/shared/stores/cart';
import { useAuthStore } from '@/shared/stores/auth';
import { ShoppingBag, User, Sprout, LogOut, LayoutDashboard, QrCode, MapPin, Calendar, Menu, X, MessageSquare } from 'lucide-react';
import { ConfirmDialog } from '@cropnet/ui';

export default function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const { user, isAuthenticated, logout, fetchCurrentUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const navLinks = [
    { href: '/products', label: 'Nông Sản Đồng Nai' },
    { href: '/ban-do', label: 'Bản Đồ Vườn' },
    { href: '/mua-vu', label: 'Lịch Mùa Vụ' },
    { href: '/traceability', label: 'Truy Xuất QR' },
    { href: '/ai-tu-van', label: 'Trợ Lý Tư Vấn' },
    { href: '/forum', label: 'Cộng Đồng' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E2E5DC]">
      {/* Editorial Announcement Bar */}
      <div className="bg-[#F1EFE8] border-b border-[#E2E5DC] text-[#647067] text-xs py-1.5 px-4 text-center font-normal flex items-center justify-center gap-2">
        <span className="bg-[#E6EAE4] text-[#2C4939] border border-[#C7D1C3] text-[11px] px-2 py-0.5 rounded font-medium">
          DiGiFest 2026
        </span>
        <span className="truncate">
          Bản Trình Diễn Nông Sản Số & Truy Xuất Nguồn Gốc — Thành Phố Đồng Nai
        </span>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#E6EAE4] border border-[#C7D1C3] flex items-center justify-center text-[#2C4939]">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#253129] leading-tight">
              CropNet <span className="text-[#647067] font-normal text-sm">Đồng Nai</span>
            </span>
            <span className="text-[11px] text-[#8C978F] font-normal leading-none">
              Nông sản bản địa minh bạch
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#647067]">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-1 border-b-2 transition-colors ${
                isActive(item.href)
                  ? 'border-[#2C4939] text-[#2C4939] font-semibold'
                  : 'border-transparent hover:text-[#2C4939]'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Role-based dashboard shortcuts for desktop */}
          {mounted && isAuthenticated && user?.role === 'CUSTOMER' && (
            <Link
              href="/dashboard/customer"
              className={`py-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard/customer')
                  ? 'border-[#2C4939] text-[#2C4939] font-semibold'
                  : 'border-transparent hover:text-[#2C4939]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Đơn mua</span>
            </Link>
          )}

          {mounted && isAuthenticated && user?.role === 'FARMER' && (
            <Link
              href="/dashboard/supplier"
              className={`py-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard/supplier')
                  ? 'border-[#2C4939] text-[#2C4939] font-semibold'
                  : 'border-transparent hover:text-[#2C4939]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Nhà vườn</span>
            </Link>
          )}

          {mounted && isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`py-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'border-[#2C4939] text-[#2C4939] font-semibold'
                  : 'border-transparent hover:text-[#2C4939]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </Link>
          )}

          {mounted && isAuthenticated && user?.role === 'LOGISTICS' && (
            <Link
              href="/dashboard/logistics"
              className={`py-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard/logistics')
                  ? 'border-[#2C4939] text-[#2C4939] font-semibold'
                  : 'border-transparent hover:text-[#2C4939]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Vận chuyển</span>
            </Link>
          )}

          {mounted && isAuthenticated && user?.role === 'INSPECTOR' && (
            <Link
              href="/dashboard/inspector"
              className={`py-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard/inspector')
                  ? 'border-[#2C4939] text-[#2C4939] font-semibold'
                  : 'border-transparent hover:text-[#2C4939]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Kiểm định</span>
            </Link>
          )}
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          {mounted && (!isAuthenticated || user?.role === 'CUSTOMER') && (
            <Link
              href="/cart"
              className="relative p-2 text-[#253129] hover:text-[#2C4939] transition-colors rounded-lg hover:bg-[#F1EFE8]"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#2C4939] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* User Auth */}
          {mounted && isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-[#647067]">
                Chào, <strong className="text-[#253129] font-medium">{user?.fullName}</strong>
              </span>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1 bg-[#F1EFE8] text-[#647067] hover:text-[#B33A3A] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E2E5DC] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Thoát</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] px-3.5 py-1.5 rounded-lg text-xs font-medium border border-[#E2E5DC] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#647067]" />
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#253129] hover:text-[#2C4939] rounded-lg hover:bg-[#F1EFE8] transition-colors focus:outline-none"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E5DC] bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#E6EAE4] text-[#2C4939] font-semibold'
                    : 'text-[#647067] hover:bg-[#F1EFE8] hover:text-[#253129]'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {mounted && isAuthenticated && user?.role === 'CUSTOMER' && (
              <Link
                href="/dashboard/customer"
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#647067] hover:bg-[#F1EFE8] flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#7B876C]" />
                <span>Đơn hàng của tôi</span>
              </Link>
            )}

            {mounted && isAuthenticated && user?.role === 'FARMER' && (
              <Link
                href="/dashboard/supplier"
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#647067] hover:bg-[#F1EFE8] flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#7B876C]" />
                <span>Kênh nhà vườn</span>
              </Link>
            )}

            {mounted && isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#647067] hover:bg-[#F1EFE8] flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#7B876C]" />
                <span>Quản trị viên</span>
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-[#E2E5DC] flex items-center justify-between">
            {mounted && isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-[#647067]">
                  {user?.fullName} ({user?.role})
                </span>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-xs text-[#B33A3A] hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="w-full text-center py-2 bg-[#2C4939] text-white rounded-lg text-sm font-medium"
              >
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        message="Quý khách có chắc chắn muốn đăng xuất khỏi CropNet Đồng Nai?"
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
        variant="danger"
      />
    </header>
  );
}
