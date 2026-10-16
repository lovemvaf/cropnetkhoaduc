import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình.'
      }, { status: 503 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return NextResponse.json({
        success: false,
        error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      data: {
        sessionValid: true,
        expiresAt: data.session.expires_at
      }
    });

    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    return response;

  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi làm mới phiên đăng nhập'
    }, { status: 500 });
  }
}
