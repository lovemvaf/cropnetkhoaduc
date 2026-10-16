import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, token_hash, type = 'signup' } = body;

    if (!token && !token_hash) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp mã hoặc liên kết xác minh.'
      }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình.'
      }, { status: 503 });
    }

    const supabase = await createClient();

    let verifyResult;
    if (token_hash) {
      verifyResult = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });
    } else {
      if (!email) {
        return NextResponse.json({
          success: false,
          error: 'Vui lòng cung cấp email cùng mã xác minh OTP.'
        }, { status: 400 });
      }

      verifyResult = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: token.trim(),
        type: 'signup',
      });
    }

    if (verifyResult.error) {
      return NextResponse.json({
        success: false,
        error: 'Mã xác minh không chính xác, đã hết hạn hoặc đã được sử dụng.'
      }, { status: 400 });
    }

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
