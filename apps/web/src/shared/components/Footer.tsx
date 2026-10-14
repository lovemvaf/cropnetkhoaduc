import React from 'react';
import { Sprout, ShieldCheck, Sparkles, MapPin, Award } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20 text-sm">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-black text-gray-950">
              CROPNET <span className="text-amber-500 font-extrabold">ĐỒNG NAI AI</span>
            </span>
          </div>
          <p className="text-gray-500 max-w-md leading-relaxed text-xs sm:text-sm">
            Nền tảng thương mại nông sản thông minh cho Hợp tác xã và nhà vườn Thành phố Đồng Nai. 
            Giải pháp số hóa tham dự cuộc thi <strong>AI Digital Business Challenge 2026</strong> trong khuôn khổ <strong>DIGIFEST Đồng Nai 2026</strong>.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-semibold border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Truy xuất QR lô thực
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-semibold border border-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Trợ lý bán hàng 24/7
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md font-semibold border border-blue-100">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Bản đồ HTX Đồng Nai
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Khám phá Nông sản</h4>
          <ul className="space-y-2 text-gray-500 text-xs sm:text-sm">
            <li><Link href="/products" className="hover:text-primary-600 transition-colors">Đặc sản Bưởi Tân Triều</Link></li>
            <li><Link href="/products" className="hover:text-primary-600 transition-colors">Sầu riêng & Chôm chôm Long Khánh</Link></li>
            <li><Link href="/ban-do" className="hover:text-primary-600 transition-colors">Bản đồ Hợp tác xã & Vườn</Link></li>
            <li><Link href="/mua-vu" className="hover:text-primary-600 transition-colors">Lịch mùa vụ thu hoạch</Link></li>
            <li><Link href="/traceability" className="hover:text-primary-600 transition-colors">Tra cứu nhật ký canh tác QR</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Hợp Tác Xã Đối Tác</h4>
          <div className="space-y-2 text-gray-500 text-xs">
            <p className="font-semibold text-gray-700">HTX Nông nghiệp Tân Triều</p>
            <p className="text-gray-400">Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai</p>
            <p className="font-semibold text-gray-700 pt-1">HTX Nông nghiệp Long Khánh</p>
            <p className="text-gray-400">Phường Xuân Lập, TP Long Khánh, TP Đồng Nai</p>
            <p className="pt-2 text-primary-600 font-bold">Hotline: 1900 6868 | cskh@cropnet.vn</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div>
          &copy; {new Date().getFullYear()} <strong>CropNet Đồng Nai AI</strong>. Đơn vị dự thi Cuộc thi AI Digital Business Challenge 2026.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Nghị quyết 30/2026/QH16 • Mã đơn vị 75 Thành phố Đồng Nai</span>
        </div>
      </div>
    </footer>
  );
}
