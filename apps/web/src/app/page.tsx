'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Badge } from '@cropnet/ui';
import { 
  ArrowRight, Leaf, Shield, Truck, QrCode, CheckCircle2, 
  Sparkles, MapPin, Calendar, Award, Users, Bot, Store
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-slate-50/40 min-h-screen">
      {/* Background Decorators */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-amber-100/20 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-left max-w-2xl">
            {/* Competition Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200/80 px-4 py-2 rounded-full text-xs font-bold text-emerald-900 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="uppercase tracking-wide font-extrabold text-[11px]">
                AI Digital Business Challenge 2026 • DiGiFest Thành phố Đồng Nai
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
              Nông Sản Bản Địa <br />
              <span className="bg-gradient-to-r from-emerald-700 via-primary-600 to-amber-600 bg-clip-text text-transparent">
                Thành Phố Đồng Nai
              </span>
            </h1>
            
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
              Nền tảng thương mại số hóa kết nối trực tiếp khách tiêu dùng và đối tác mua sỉ tới 
              <strong> Hợp Tác Xã Nông Nghiệp Tân Triều</strong>, <strong>HTX Nông Nghiệp Long Khánh</strong> và các vùng trồng cây ăn trái chủ lực Thành phố Đồng Nai. 
              Tích hợp <strong>AI Bán Hàng 24/7</strong> và <strong>QR Truy Xuất Nguồn Gốc Lô Thực</strong> minh bạch từ nông trại.
            </p>
            
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                href="/products" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-2xl font-bold transition-all hover:scale-103 active:scale-95 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Xem Nông Sản Đồng Nai</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/ai-tu-van" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all hover:scale-103 active:scale-95 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-100" />
                <span>AI Tư Vấn Theo Ngân Sách</span>
              </Link>
              <Link 
                href="/traceability" 
                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-5 py-3.5 rounded-2xl font-bold transition-all hover:scale-103 active:scale-95 shadow-xs flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Quét Mã QR Lô Hàng</span>
              </Link>
            </div>

            {/* Verified Regional Facts Banner */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80 text-left">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-gray-900">02 HTX</h4>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Tân Triều & Long Khánh</p>
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-gray-900">100% Lô</h4>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Có mã QR & Nhật ký</p>
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-emerald-700">24/7 AI</h4>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Tư vấn báo giá tức thì</p>
              </div>
            </div>
          </div>

          {/* Hero Feature Visual Card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 p-4 transition-transform hover:scale-102 duration-300">
              <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format"
                  alt="Vườn bưởi Tân Triều Đồng Nai"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent" />
                
                {/* Floating QR preview label */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-xl flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-extrabold text-xs text-gray-900 truncate">Bưởi Đường Lá Cam Tân Triều</h5>
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">OCOP</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                      Lô: BATCH-BUOI-TANTRIEU-2026-01
                    </p>
                  </div>
                  <Link 
                    href="/traceability/BATCH-BUOI-TANTRIEU-2026-01" 
                    className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Xem Lô
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4 Core Pillars of CropNet Dong Nai AI */}
      <section className="py-20 bg-white border-y border-gray-100">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-100">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Giá Trị Chuyển Đổi Số Thực Tiễn</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Giải Pháp Thương Mại Nông Sản Toàn Diện
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">
              CropNet Đồng Nai AI đồng hành cùng Hợp tác xã giải quyết trực diện 3 bài toán khó: 
              Minh bạch xuất xứ nông sản, Tự động hóa tư vấn bán hàng 24/7 và Kết nối bao tiêu sản phẩm bản địa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: QR Traceability */}
            <div className="p-6 border border-gray-100 rounded-3xl space-y-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white to-emerald-50/20">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Truy Xuất QR Lô Hàng Thực</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">
                Mỗi lô thu hoạch có mã QR riêng. Người tiêu dùng quét camera để xem hình ảnh vườn thực tế, nhật ký chăm bón và hồ sơ kiểm định đã xác minh.
              </p>
              <Link href="/traceability" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1">
                <span>Trải nghiệm quét mã</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 2: AI Sales Copilot */}
            <div className="p-6 border border-gray-100 rounded-3xl space-y-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white to-amber-50/20">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">AI Bán Hàng & Gợi Ý 24/7</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">
                Chatbot AI thông minh hiểu tiếng Việt tự nhiên, gợi ý giỏ quà trái cây theo đúng ngân sách, kiểm tra tồn kho server-side và tự động soạn báo giá sỉ.
              </p>
              <Link href="/ai-tu-van" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 pt-1">
                <span>Thử AI tư vấn</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 3: Farm Map */}
            <div className="p-6 border border-gray-100 rounded-3xl space-y-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white to-blue-50/20">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Bản Đồ Nhà Vườn Số</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">
                Định vị trực quan các vùng trồng bưởi Tân Triều, vườn sầu riêng Long Khánh trên bản đồ OpenStreetMap. Lọc theo xã/phường và loại nông sản.
              </p>
              <Link href="/ban-do" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 pt-1">
                <span>Mở bản đồ vườn</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 4: Seasonal Harvest Calendar */}
            <div className="p-6 border border-gray-100 rounded-3xl space-y-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white to-purple-50/20">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Lịch Mùa Vụ Minh Bạch</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">
                Cập nhật chính xác thời điểm thu hoạch rộ của bưởi Tân Triều, chôm chôm và sầu riêng Long Khánh, giúp khách sỉ đặt trước với giá ưu đãi.
              </p>
              <Link href="/mua-vu" className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 pt-1">
                <span>Xem lịch mùa vụ</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Cooperatives Showcase */}
      <section className="py-20 bg-slate-50/60">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Chủ Thể Sản Xuất & Liên Kết
              </span>
              <h2 className="text-3xl font-black text-gray-950 tracking-tight">
                Hợp Tác Xã Tiêu Biểu Thành Phố Đồng Nai
              </h2>
            </div>
            <Link 
              href="/ban-do" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Xem tất cả vùng trồng trên bản đồ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cooperative 1: Tan Trieu */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-100">
                    OCOP ĐẶC SẢN ĐỒNG NAI
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mt-2">
                    Hợp Tác Xã Nông Nghiệp Tân Triều
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                  HTX
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Vùng trồng bưởi cù lao Tân Triều trứ danh được bồi đắp bởi phù sa sông Đồng Nai. Chuyên canh giống <strong>Bưởi đường lá cam</strong> và <strong>Bưởi da xanh</strong> đạt tiêu chuẩn an toàn sinh thái, vỏ mỏng ruột mọng nước ngọt thanh.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">Bưởi đường lá cam</span>
                <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">Bưởi da xanh</span>
                <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">Rượu bưởi truyền thống</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-bold">100% Lô hàng có nhật ký số</span>
                <Link 
                  href="/products?supplier=tan-trieu" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Xem Sản Phẩm
                </Link>
              </div>
            </div>

            {/* Cooperative 2: Long Khanh */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
                    VÙNG CÂY ĂN TRÁI TRỌNG ĐIỂM
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mt-2">
                    Hợp Tác Xã Nông Nghiệp Long Khánh
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Phường Xuân Lập, TP Long Khánh, Thành phố Đồng Nai</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                  HTX
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Vùng đất đỏ bazan màu mỡ nổi tiếng miền Đông Nam Bộ. Hợp tác xã liên kết hơn 30 hộ nông dân canh tác <strong>Sầu riêng Ri6</strong> chín già tự nhiên không nhúng thuốc và <strong>Chôm chôm nhãn Long Khánh</strong> cơm dày giòn ngọt.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">Sầu riêng Ri6 hạt lép</span>
                <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">Chôm chôm nhãn</span>
                <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-semibold">Hạt điều rang muối</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-amber-700 font-bold">Chính sách thu hoạch chín tự nhiên</span>
                <Link 
                  href="/products?supplier=long-khanh" 
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Xem Sản Phẩm
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Direct AI Consultation Callout */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-primary-900 to-gray-950 text-white relative overflow-hidden">
        <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Trợ Lý Bán Hàng Trí Tuệ Nhân Tạo 24/7</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Bạn Cần Mua Trái Cây Biếu Tặng Hoặc Mua Sỉ Cho Doanh Nghiệp?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              Chỉ cần nhập yêu cầu tự nhiên: <em>"Tôi có ngân sách 400.000đ, muốn mua giỏ bưởi Tân Triều giao phường Quyết Thắng"</em>. 
              AI của CropNet sẽ tra cứu trực tiếp kho hàng HTX, tính toán chi phí chính xác và tạo giỏ hàng hoặc phiếu báo giá sỉ tức thì.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/ai-tu-van"
                className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-7 py-3.5 rounded-2xl text-xs sm:text-sm transition-all hover:scale-103 active:scale-95 flex items-center gap-2 shadow-lg shadow-amber-500/25"
              >
                <Bot className="w-4 h-4" />
                <span>Bắt đầu trò chuyện với AI</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-center">
            <div className="p-6 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 text-left space-y-3 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Cam Kết Chống Bịa Đặt (Zero Hallucination)</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                Mọi mức giá, số lượng tồn kho và thông tin kiểm định do AI đưa ra đều được truy vấn trực tiếp từ cơ sở dữ liệu thật của Hợp tác xã, không để AI tự ý định giá.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
