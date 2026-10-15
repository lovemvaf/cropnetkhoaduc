import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp email tài khoản.'
      }, { status: 400 });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      // Anti-enumeration: Return success even if not found
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
      });
    }

    const resetToken = crypto.randomBytes(16).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresAt
    });

    return NextResponse.json({
      success: true,
      message: 'Mã khôi phục mật khẩu đã được tạo thành công!',
      data: {
        resetToken // Provided for test & development environment verification
      }
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi gửi yêu cầu khôi phục'
    }, { status: 500 });
  }
}
