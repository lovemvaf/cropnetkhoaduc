import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, roleName = 'CUSTOMER', farmName, address } = body;

    // 1. Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Email không đúng định dạng.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự.' }, { status: 400 });
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Họ và tên không được để trống.' }, { status: 400 });
    }

    // Role safety: Only CUSTOMER and FARMER can self-register
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
      if (!farmName || !farmName.trim()) {
        return NextResponse.json({ success: false, error: 'Vui lòng cung cấp Tên Nông Trại / Hợp Tác Xã.' }, { status: 400 });
      }
      if (!address || !address.trim()) {
        return NextResponse.json({ success: false, error: 'Vui lòng cung cấp Địa chỉ vùng canh tác tại Đồng Nai.' }, { status: 400 });
      }
    }

    // 2. Anti-duplication check
    const existing = db.findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email này đã được sử dụng. Vui lòng đăng nhập.' }, { status: 409 });
    }

    // 3. Password hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Generate verification token (6-char secure crypto hex)
    const verificationToken = crypto.randomBytes(3).toString('hex').toUpperCase();

    // 5. Persist user to database
    const newUser = db.createUser({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : undefined,
      role: roleName,
      status: roleName === 'FARMER' ? 'PENDING' : 'ACTIVE',
      farmName: roleName === 'FARMER' ? farmName.trim() : null,
      address: roleName === 'FARMER' ? address.trim() : null,
      isEmailVerified: false,
      verificationToken
    });

    return NextResponse.json({
      success: true,
      message: roleName === 'FARMER'
        ? 'Đăng ký hồ sơ HTX / Nhà vườn thành công! Hồ sơ đang chờ Ban Quản trị phê duyệt và mã xác minh đã được tạo.'
        : 'Đăng ký tài khoản thành công! Vui lòng xác minh email trước khi đăng nhập.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
        verificationToken // Delivered for automated testing & development verification
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi xử lý đăng ký' }, { status: 500 });
  }
}
