import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp mã khôi phục và mật khẩu mới.'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.'
      }, { status: 400 });
    }

    const cleanToken = token.trim().toUpperCase();
    const user = db.findUserByResetToken(cleanToken);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Mã khôi phục không chính xác hoặc đã hết hạn.'
      }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    db.updateUser(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.'
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi đặt lại mật khẩu'
    }, { status: 500 });
  }
}
