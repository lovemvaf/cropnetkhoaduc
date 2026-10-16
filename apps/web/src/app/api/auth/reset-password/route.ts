import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp mật khẩu mới.'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.'
      }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình.'
      }, { status: 503 });
    }

    const supabase = await createClient();

    // Verify that user is currently in authenticated recovery session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Phiên khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.'
      }, { status: 401 });
    }

    // Update user password
    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message || 'Không thể cập nhật mật khẩu.'
      }, { status: 400 });
    }

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
