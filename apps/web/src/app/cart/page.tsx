'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/shared/stores/cart';
import { formatVND } from '@cropnet/utils';
import { Container, Card } from '@cropnet/ui';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-400">Hãy thêm những bó rau quả sạch của nhà nông vào giỏ hàng nhé!</p>
        <Link href="/products" className="inline-block bg-primary-500 text-white px-6 py-3 rounded-xl font-bold">
          Quay lại mua sắm
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-12 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900">Giỏ Hàng Nông Sản</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="flex items-center gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-400">{item.unit}</p>
                <span className="text-sm font-bold text-primary-500">{formatVND(item.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center">-</button>
                <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center">+</button>
              </div>
              <button onClick={() => removeItem(item.productId)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </Card>
          ))}
        </div>

        <Card className="h-fit space-y-6">
          <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-4">Tóm tắt đơn hàng</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tạm tính</span>
            <span className="font-medium">{formatVND(getTotalPrice())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phí giao hàng (Mock)</span>
            <span className="font-medium text-green-500">Miễn phí</span>
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg">
            <span>Tổng cộng</span>
            <span className="text-primary-500">{formatVND(getTotalPrice())}</span>
          </div>
          <Link href="/checkout" className="block text-center bg-primary-500 text-white w-full py-4 rounded-2xl font-bold hover:bg-primary-600 transition-colors">
            Tiến hành đặt hàng
          </Link>
        </Card>
      </div>
    </Container>
  );
}
