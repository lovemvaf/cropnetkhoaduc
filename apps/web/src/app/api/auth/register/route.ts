import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, roleName = 'CUSTOMER', farmName, address } = body;

    // 1. Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Email không đúng định dạng.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ success: false, error: 'Email không đúng định dạng hợp lệ.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự.' }, { status: 400 });
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Họ và tên không được để trống.' }, { status: 400 });
    }

    // Role safety guardrail: Public self-registration only permits CUSTOMER or FARMER
    if (roleName === 'ADMIN' || roleName === 'INSPECTOR' || roleName === 'LOGISTICS') {
      return NextResponse.json({
        success: false,
        error: 'Vai trò này yêu cầu cấp quyền từ Quản trị viên hệ thống, không thể tự đăng ký.'
      }, { status: 403 });
    }

    if (roleName !== 'CUSTOMER' && roleName !== 'FARMER') {
      return NextResponse.json({ success: false, error: 'Vai trò đăng ký không hợp lệ.' }, { status: 400 });
    }

    if (roleName === 'FARMER') {
      if (!farmName || typeof farmName !== 'string' || !farmName.trim()) {
        return NextResponse.json({ success: false, error: 'Vui lòng cung cấp Tên Nông Trại / Hợp Tác Xã.' }, { status: 400 });
      }
      if (!address || typeof address !== 'string' || !address.trim()) {
        return NextResponse.json({ success: false, error: 'Vui lòng cung cấp Địa chỉ vùng canh tác tại Đồng Nai.' }, { status: 400 });
      }
    }

    // Check Supabase availability
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Cơ sở dữ liệu Supabase chưa được cấu hình biến môi trường trên hệ thống.'
      }, { status: 503 });
    }

    const supabase = await createClient();

    // Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone ? String(phone).trim() : null,
          role: roleName,
          farm_name: roleName === 'FARMER' ? farmName.trim() : null,
          address: roleName === 'FARMER' ? address.trim() : null
        }
      }
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('unique')) {
        return NextResponse.json({
          success: false,
          error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.'
        }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Success response without exposing any tokens or secrets
    return NextResponse.json({
      success: true,
      message: roleName === 'FARMER'
        ? 'Đăng ký hồ sơ HTX / Nhà vườn thành công! Hồ sơ đang ở trạng thái chờ Ban Quản trị phê duyệt.'
        : 'Đăng ký tài khoản thành công! Vui lòng xác minh email trước khi đăng nhập.',
      data: {
        userId: data.user?.id,
        email: data.user?.email,
        fullName: fullName.trim(),
        role: roleName,
        status: roleName === 'FARMER' ? 'PENDING' : 'ACTIVE'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi xử lý đăng ký' }, { status: 500 });
  }
}
