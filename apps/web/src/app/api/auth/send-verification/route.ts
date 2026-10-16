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

    // Resend confirmation email via Supabase Auth
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });

    if (error) {
      // If rate limited
      if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
        return NextResponse.json({
          success: false,
          error: 'Vui lòng đợi vài phút trước khi yêu cầu gửi lại email xác minh (chống lạm dụng gửi mail).'
        }, { status: 429 });
      }

      console.error('Supabase resend email error:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Không thể gửi email xác minh vào lúc này.'
      }, { status: 400 });
    }

    // Success response WITHOUT exposing any raw token
    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, thư xác minh mới đã được gửi tới hộp thư của bạn.'
    });

  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi gửi yêu cầu xác minh email'
    }, { status: 500 });
  }
}
