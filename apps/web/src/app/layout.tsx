import React from 'react';
import '../styles/globals.css';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import { Inter } from 'next/font/google';

import FloatingAiWidget from '@/shared/components/FloatingAiWidget';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: 'CropNet Đồng Nai AI — Nền Tảng Thương Mại Nông Sản Thông Minh & Truy Xuất Nguồn Gốc',
  description: 'Kết nối trực tiếp người tiêu dùng và khách sỉ tới các Hợp tác xã nông sản Thành phố Đồng Nai (Bưởi Tân Triều, Sầu riêng Long Khánh, Chôm chôm, Hạt điều). Truy xuất mã QR lô hàng thực và Trợ lý AI tư vấn bán hàng 24/7.',
  keywords: ['CropNet', 'Đồng Nai AI', 'Nông sản Đồng Nai', 'Bưởi Tân Triều', 'Sầu riêng Long Khánh', 'Truy xuất nguồn gốc QR', 'DIGIFEST 2026'],
  openGraph: {
    title: 'CropNet Đồng Nai AI — Nông Sản Sạch Minh Bạch Nguồn Gốc',
    description: 'Nền tảng thương mại nông sản thông minh cho Hợp tác xã và nhà vườn Thành phố Đồng Nai. Hỗ trợ truy xuất mã QR từng lô hàng và AI tư vấn bán hàng.',
    type: 'website',
    locale: 'vi_VN'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans bg-slate-50/50 text-gray-900 antialiased selection:bg-primary-100 selection:text-primary-900">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingAiWidget />
      </body>
    </html>
  );
}
