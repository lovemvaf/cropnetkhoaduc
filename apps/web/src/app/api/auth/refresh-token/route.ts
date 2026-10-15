import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyRefreshToken, generateTokens, setAuthCookies } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    let token = request.cookies.get('refreshToken')?.value;

    if (!token) {
      try {
        const body = await request.json();
        token = body.refreshToken;
      } catch {
        // no body
      }
    }

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Refresh token không được tìm thấy.'
      }, { status: 401 });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: 'Refresh token không hợp lệ hoặc đã hết hạn.'
      }, { status: 401 });
    }

    const user = db.findUserById(payload.userId);
    if (!user || user.status === 'SUSPENDED') {
      return NextResponse.json({
        success: false,
        error: 'Tài khoản không hợp lệ hoặc đã bị khóa.'
      }, { status: 401 });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken
      }
    });

    setAuthCookies(response, accessToken, newRefreshToken);
    return response;

  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi làm mới phiên đăng nhập'
    }, { status: 500 });
  }
}
