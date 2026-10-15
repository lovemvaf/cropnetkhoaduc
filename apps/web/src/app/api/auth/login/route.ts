import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';
import { generateTokens, setAuthCookies } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ email và mật khẩu.'
      }, { status: 400 });
    }

    // 1. Look up user
    const user = db.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Email hoặc mật khẩu không chính xác.'
      }, { status: 401 });
    }

    // 2. Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Email hoặc mật khẩu không chính xác.'
      }, { status: 401 });
    }

    // 3. Status checks
    if (user.status === 'SUSPENDED') {
      return NextResponse.json({
        success: false,
        error: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ CropNet.'
      }, { status: 403 });
    }

    // 4. Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 5. Build user response object (exclude passwordHash)
    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      role: user.role,
      status: user.status,
      farmName: user.farmName || null,
      address: user.address || null,
      isEmailVerified: user.isEmailVerified,
      supplierStatus: user.role === 'FARMER' ? user.status : null
    };

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        accessToken,
        user: safeUser
      }
    });

    // 6. Set HttpOnly cookies
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi xử lý đăng nhập'
    }, { status: 500 });
  }
}
