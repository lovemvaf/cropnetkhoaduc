import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công khỏi hệ thống CropNet.'
    });

    clearAuthCookies(response);
    return response;
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi đăng xuất'
    }, { status: 500 });
  }
}
