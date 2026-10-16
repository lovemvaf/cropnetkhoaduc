import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp email tài khoản.'
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình.'
      }, { status: 503 });
    }

    const supabase = await createClient();

    // Determine safe redirect URL
    const origin = request.nextUrl.origin || 'https://cropnetkhoaduc.vercel.app';
    const redirectTo = `${origin}/reset-password`;

    // Request password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
        return NextResponse.json({
          success: false,
          error: 'Vui lòng đợi vài phút trước khi gửi lại yêu cầu đặt lại mật khẩu.'
        }, { status: 429 });
      }
      console.warn('Reset password error from Supabase:', error.message);
    }

    // Anti-enumeration: Always return the same neutral success message
    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống CropNet, liên kết khôi phục mật khẩu đã được gửi đến hòm thư của bạn.'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi gửi yêu cầu khôi phục'
    }, { status: 500 });
  }
}
