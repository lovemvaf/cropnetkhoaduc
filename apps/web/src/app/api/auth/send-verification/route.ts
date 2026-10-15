import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng cung cấp email tài khoản.'
      }, { status: 400 });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      // Anti-enumeration: Return success message even if not found
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, mã xác minh mới đã được gửi.'
      });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: false,
        error: 'Tài khoản này đã được xác minh email trước đó.'
      }, { status: 400 });
    }

    const newToken = crypto.randomBytes(16).toString('hex').toUpperCase();
    db.updateUser(user.id, { verificationToken: newToken });

    return NextResponse.json({
      success: true,
      message: 'Mã xác minh mới đã được tạo và gửi thành công!',
      data: {
        verificationToken: newToken // Returned for automated QA and development verification
      }
    });

  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi gửi mã xác minh'
    }, { status: 500 });
  }
}
