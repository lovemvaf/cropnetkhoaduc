'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Badge } from '@cropnet/ui';
import { ArrowRight, Leaf, Shield, Truck, QrCode, CheckCircle, Heart, Star, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-slate-50/30 min-h-screen">
      {/* Background Decorators */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-emerald-100/10 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-8 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-50/80 border border-emerald-100/80 px-4 py-2 rounded-full text-xs font-bold text-primary-600 backdrop-blur-md shadow-sm transition-transform hover:scale-102">
              <Leaf className="w-3.5 h-3.5" />
              <span>MÔ HÌNH D2C TIÊU CHUẨN • TỪ VƯỜN TỚI BÀN ĂN</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-tight sm:leading-none">
              Nông Sản Sạch <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary-500 to-emerald-600 bg-clip-text text-transparent">Minh Bạch Nguồn Gốc</span>
            </h1>
            
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed font-medium">
              Loại bỏ hoàn toàn thương lái trung gian. Kết nối trực tiếp người tiêu dùng tới các Hợp tác xã VietGAP uy tín. Quét mã QR kiểm tra nhật ký nông trường, giấy kiểm định độc lập và logistics lạnh trong tích tắc.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/products" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-103 active:scale-[0.98] shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
              >
                <span>Mua sắm sản phẩm sạch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/supplier" 
                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-103 active:scale-[0.98] shadow-sm flex items-center justify-center"
              >
                Kênh bán nhà vườn
              </Link>
            </div>

            {/* Simple stats banner */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 text-left">
              <div>
                <h4 className="text-2xl font-black text-gray-900">50+</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Hợp tác xã VietGAP</p>
              </div>
              <div>
                <h4 className="text-2xl font-black text-gray-900">100%</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Sản phẩm có QR Code</p>
              </div>
              <div>
                <h4 className="text-2xl font-black text-gray-900">10k+</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Đơn hàng thành công</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-premium bg-white border border-gray-100 p-4 transition-transform hover:scale-102 duration-300">
              <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format"
                  alt="Farm Greenery"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent" />
                
                {/* Floating QR preview label */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary-500 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="font-extrabold text-xs text-gray-900 truncate">Lô Xoài Cát Cái Mơn</h5>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Mã số: BATCH-XOAI-029</p>
                  </div>
                  <Badge variant="success" className="text-[9px]">Đạt chuẩn</Badge>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust & Transparency Feature Grid */}
      <section className="py-24 bg-white border-y border-gray-100/50">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              <span>An Tâm Tuyệt Đối</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">Tại sao nên chọn CropNet?</h2>
            <p className="text-gray-500 leading-relaxed font-semibold">
              Chúng tôi chuẩn hóa chất lượng thông qua chuỗi giám sát số hóa khép kín từ khâu gieo hạt, bón phân tới khi bàn giao tại nhà bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-100 rounded-3xl space-y-4 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary-500 border border-emerald-100">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Rau Quả Thu Hoạch Trong Ngày</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Nông sản được thu hoạch vào sáng sớm tại trang trại liên kết, sơ chế đóng gói ngay tại nhà vườn đạt chuẩn VietGAP rồi vận chuyển trong ngày.
              </p>
            </div>

            <div className="p-8 border border-gray-100 rounded-3xl space-y-4 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary-500 border border-emerald-100">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Truy Xuất Nguồn Gốc Bằng QR</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Mỗi lô thu hoạch được gán một mã QR duy nhất. Khách hàng chỉ cần quét mã để xem toàn bộ thông tin nông trường, nhật ký bón phân, xét nghiệm dư lượng BVTV.
              </p>
            </div>

            <div className="p-8 border border-gray-100 rounded-3xl space-y-4 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary-500 border border-emerald-100">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Vận Chuyển Logistics Lạnh</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Nông sản tươi dễ hư hỏng được bảo quản trong hệ thống xe lạnh đối tác chuyên nghiệp, cam kết hạn chế dập nát, giảm thiểu hao hụt nguồn dinh dưỡng.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Social-Commerce Callout (Farm Stories) */}
      <section className="py-24 bg-gradient-to-br from-white to-emerald-50/30">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[420px] aspect-video sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-premium border border-gray-100 bg-gray-100 transition-transform hover:scale-102 duration-300">
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format" 
                alt="Farmer working on story" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent" />
              
              {/* Floating dialog simulation */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-black text-emerald-800">HTX</div>
                  <div>
                    <h5 className="font-extrabold text-xs text-gray-900">Hợp Tác Xã Cái Mơn</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Đã chia sẻ nhật ký</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-650 leading-relaxed font-semibold italic">
                  "Đợt này bón lót phân trùn quế vi sinh tự ủ. Trái tròn đều, vỏ mỏng bóng đẹp đạt chuẩn hữu cơ..."
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6 max-w-xl text-left">
            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-100">
              <Users className="w-3.5 h-3.5" />
              <span>Social Commerce Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
              Diễn Đàn Cộng Đồng <br />
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">Gắn Kết Nhà Vườn & Người Mua</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
              Không chỉ đơn thuần là mua bán, CropNet là không gian cộng đồng để bà con nông dân viết nhật ký nông trại (Farm Stories), chia sẻ ảnh thực địa quá trình chăm bón và trao đổi trực tiếp với khách hàng của mình, xây dựng niềm tin tuyệt đối.
            </p>
            <div className="flex gap-4 pt-2">
              <Link 
                href="/forum" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs transition-all hover:scale-103 active:scale-95 flex items-center gap-2 shadow-md shadow-emerald-600/10"
              >
                <span>Xem nhật ký nhà vườn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
