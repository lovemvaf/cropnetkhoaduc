import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check Supabase environment configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình biến môi trường trên hệ thống.'
      }, { status: 503 });
    }

    const supabase = await createClient();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (authError || !authData.user) {
      return NextResponse.json({
        success: false,
        error: 'Email hoặc mật khẩu không chính xác.'
      }, { status: 401 });
    }

    const authUser = authData.user;

    // 2. Fetch authoritative profile from public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, status')
      .eq('id', authUser.id)
      .single();

    // Fetch supplier info if user is farmer
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

    // 3. Status checks
    if (status === 'SUSPENDED') {
      await supabase.auth.signOut();
      return NextResponse.json({
        success: false,
        error: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ CropNet.'
      }, { status: 403 });
    }

    // 4. Construct sanitized user profile
    const safeUser = {
      id: authUser.id,
      email: authUser.email || normalizedEmail,
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
      message: 'Đăng nhập thành công!',
      data: {
        user: safeUser
      }
    });

    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    return response;

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi xử lý đăng nhập'
    }, { status: 500 });
  }
}
