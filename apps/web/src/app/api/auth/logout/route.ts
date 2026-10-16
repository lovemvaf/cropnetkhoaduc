import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }

    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công khỏi hệ thống CropNet.'
    });

    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi đăng xuất'
    }, { status: 500 });
  }
}
