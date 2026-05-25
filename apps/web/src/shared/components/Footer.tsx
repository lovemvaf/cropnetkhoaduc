import React from 'react';
import { Sprout } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-primary-500 font-bold text-xl mb-4">
            <Sprout className="w-6 h-6" />
            <span>CROPNET</span>
          </div>
          <p className="text-gray-500 max-w-sm">
            Sàn thương mại điện tử kết nối trực tiếp nông trại Việt Nam tới bàn ăn gia đình. Đảm bảo 100% minh bạch nguồn gốc sản phẩm qua mã QR.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Liên kết nhanh</h4>
          <ul className="space-y-2 text-gray-500">
            <li><a href="/products" className="hover:text-primary-500">Mua sắm</a></li>
            <li><a href="/forum" className="hover:text-primary-500">Cộng đồng</a></li>
            <li><a href="/dashboard/supplier" className="hover:text-primary-500">Góc nhà vườn</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Liên hệ hỗ trợ</h4>
          <p className="text-gray-500">Email: support@cropnet.vn</p>
          <p className="text-gray-500">Hotline: 1900 6868</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} CROPNET. Đồ án Startup nông nghiệp sạch dành cho sinh viên Việt Nam.
      </div>
    </footer>
  );
}
