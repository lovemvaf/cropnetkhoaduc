import React from 'react';
import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';

import FloatingAiWidget from '@/shared/components/FloatingAiWidget';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
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
    <html lang="vi" className={`${beVietnamPro.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans bg-[#FAF9F5] text-[#253129] antialiased selection:bg-[#E6EAE4] selection:text-[#2C4939]">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingAiWidget />
      </body>
    </html>
  );
}
