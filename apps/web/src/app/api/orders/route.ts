import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getUserFromRequest } from '@/server/auth';
import { VERIFIED_PRODUCTS } from '@/data/catalog';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng đăng nhập để xem danh sách đơn hàng.'
      }, { status: 401 });
    }

    const orders = db.getOrdersByUser(user.id);
    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi tải đơn hàng'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const body = await request.json();
    const { items = [], shippingAddress, paymentMethod = 'COD', customerName, customerPhone, customerEmail } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Giỏ hàng trống. Vui lòng chọn sản phẩm trước khi đặt hàng.'
      }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp địa chỉ nhận hàng đầy đủ.'
      }, { status: 400 });
    }

    // Server-side price & total calculation (Prevent client-side price tampering)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = VERIFIED_PRODUCTS.find(p => p.id === item.productId || p.id === item.id);
      if (!product) {
        return NextResponse.json({
          success: false,
          error: `Sản phẩm với mã ${item.productId || item.id} không tồn tại trên hệ thống.`
        }, { status: 400 });
      }

      const qty = Math.max(1, parseInt(item.quantity || '1', 10));
      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty,
        total: itemTotal,
        unit: product.unit
      });
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const newOrder = db.createOrder({
      customerId: user ? user.id : 'guest-customer',
      customerName: customerName || (user ? user.fullName : 'Khách vãng lai'),
      customerEmail: customerEmail || (user ? user.email : 'guest@cropnet.vn'),
      customerPhone: customerPhone || (user ? (user.phone || '') : ''),
      shippingAddress: shippingAddress.trim(),
      items: validatedItems,
      subtotal,
      shippingFee,
      total,
      status: 'PENDING',
      paymentMethod,
      paymentStatus: 'UNPAID'
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt hàng thành công! Đơn hàng đang được Hợp tác xã xác nhận.',
      data: newOrder
    }, { status: 201 });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi xử lý đặt hàng'
    }, { status: 500 });
  }
}
