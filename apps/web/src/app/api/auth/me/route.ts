import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình biến môi trường.'
      }, { status: 503 });
    }

    const supabase = await createClient();

    // Authoritative server-side identity verification
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      const response = NextResponse.json({
        success: false,
        error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.'
      }, { status: 401 });
      response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
      return response;
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, status')
      .eq('id', authUser.id)
      .single();

    let supplierProfile = null;
    if (profile?.role === 'FARMER' || authUser.user_metadata?.role === 'FARMER') {
      const { data: sProfile } = await supabase
        .from('supplier_profiles')
        .select('farm_name, address, status')
        .eq('profile_id', authUser.id)
        .single();
      supplierProfile = sProfile;
    }

    const role = profile?.role || authUser.user_metadata?.role || 'CUSTOMER';
    const status = profile?.status || 'ACTIVE';

    const safeUser = {
      id: authUser.id,
      email: authUser.email,
      fullName: profile?.full_name || authUser.user_metadata?.full_name || 'Thành viên CropNet',
      phone: profile?.phone || authUser.user_metadata?.phone || null,
      role,
      status,
      farmName: supplierProfile?.farm_name || authUser.user_metadata?.farm_name || null,
      address: supplierProfile?.address || authUser.user_metadata?.address || null,
      isEmailVerified: !!authUser.email_confirmed_at,
      supplierStatus: role === 'FARMER' ? (supplierProfile?.status || 'PENDING') : null
    };

    const response = NextResponse.json({
      success: true,
      data: {
        user: safeUser
      }
    });

    // Ensure user-specific response is NEVER cached across intermediate proxies or CDN
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    return response;

  } catch (error: any) {
    console.error('Get me error:', error);
    const response = NextResponse.json({
      success: false,
      error: error.message || 'Lỗi kiểm tra phiên làm việc'
    }, { status: 500 });
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    return response;
  }
}
