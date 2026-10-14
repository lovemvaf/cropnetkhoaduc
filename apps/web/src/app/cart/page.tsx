'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/shared/stores/cart';
import { formatVND } from '@cropnet/utils';
import { Container } from '@cropnet/ui';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { getAssetPath } from '@/shared/utils/path';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF9F5] min-h-[60vh] flex items-center justify-center py-16">
        <Container className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-[#E6EAE4] text-[#2C4939] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#253129]">Giỏ hàng của quý khách đang trống</h2>
          <p className="text-xs sm:text-sm text-[#647067]">
            Hãy khám phá nông sản tươi ngon của Hợp tác xã Tân Triều và Long Khánh để thêm vào giỏ nhé.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#2C4939] hover:bg-[#233C2F] text-white px-5 py-2.5 rounded-lg text-xs font-medium transition-colors"
            >
              <span>Khám phá nông sản</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8 max-w-5xl">
        <div className="border-b border-[#E2E5DC] pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#253129]">
            Giỏ Hàng Nông Sản ({items.length} món)
          </h1>
          <p className="text-xs text-[#647067] mt-1">
            Đơn hàng kết nối trực tiếp với nhà vườn Hợp tác xã Thành phố Đồng Nai
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl border border-[#E2E5DC] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 rounded-lg bg-[#F1EFE8] border border-[#E2E5DC] overflow-hidden flex-shrink-0">
                    <img
                      src={getAssetPath(item.imageUrl) || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-[#253129] truncate">{item.name}</h4>
                    <p className="text-xs text-[#8C978F]">{item.unit}</p>
                    <span className="text-xs font-bold text-[#2C4939] mt-0.5 block">
                      {formatVND(item.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E5DC]">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#E2E5DC] rounded-lg bg-[#FAF9F5]">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-[#253129] hover:bg-[#F1EFE8] rounded-l-lg transition-colors text-sm font-semibold"
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-[#253129]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#253129] hover:bg-[#F1EFE8] rounded-r-lg transition-colors text-sm font-semibold"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-xs text-[#8C978F]">Thành tiền</div>
                    <div className="text-sm font-bold text-[#253129]">
                      {formatVND(item.price * item.quantity)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-[#8C978F] hover:text-[#B33A3A] p-1.5 rounded-md hover:bg-[#FDF0ED] transition-colors"
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E5DC] p-5 shadow-subtle space-y-4">
            <h3 className="font-semibold text-base text-[#253129] border-b border-[#E2E5DC] pb-3">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#647067]">Tạm tính ({items.length} món):</span>
                <span className="font-medium text-[#253129]">{formatVND(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647067]">Phí vận chuyển:</span>
                <span className="font-medium text-[#2C4939]">Miễn phí khảo sát</span>
              </div>
            </div>

            <div className="border-t border-[#E2E5DC] pt-3 flex justify-between items-baseline">
              <span className="font-bold text-sm text-[#253129]">Tổng thanh toán:</span>
              <span className="font-bold text-lg text-[#2C4939]">
                {formatVND(getTotalPrice())}
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/checkout"
                className="block text-center bg-[#2C4939] hover:bg-[#233C2F] text-white w-full py-2.5 rounded-lg text-xs font-medium transition-colors"
              >
                Tiến hành thanh toán
              </Link>
              <Link
                href="/products"
                className="block text-center text-xs text-[#647067] hover:underline"
              >
                Tiếp tục xem thêm nông sản
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
