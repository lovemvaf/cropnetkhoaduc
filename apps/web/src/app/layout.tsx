import React from 'react';
import '../styles/globals.css';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: 'CropNet - Sàn TMĐT Nông Sản Việt Nam',
  description: 'Kết nối trực tiếp nông dân và người tiêu dùng sạch'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans bg-slate-50/50 text-gray-900 antialiased selection:bg-primary-100 selection:text-primary-900">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
