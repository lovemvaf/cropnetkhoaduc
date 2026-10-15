import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp mã xác minh.'
      }, { status: 400 });
    }

    const cleanToken = token.trim().toUpperCase();
    const user = db.findUserByVerificationToken(cleanToken);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Mã xác minh không chính xác, đã hết hạn hoặc đã được sử dụng.'
      }, { status: 400 });
    }

    // Mark email as verified and invalidate token
    db.updateUser(user.id, {
      isEmailVerified: true,
      verificationToken: null
    });

    return NextResponse.json({
      success: true,
      message: 'Xác minh email thành công! Tài khoản đã sẵn sàng đăng nhập.'
    });

  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi xác minh email'
    }, { status: 500 });
  }
}
