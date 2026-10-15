import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn.'
      }, { status: 401 });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      role: user.role,
      status: user.status,
      farmName: user.farmName || null,
      address: user.address || null,
      isEmailVerified: user.isEmailVerified,
      supplierStatus: user.role === 'FARMER' ? user.status : null
    };

    return NextResponse.json({
      success: true,
      data: {
        user: safeUser
      }
    });

  } catch (error: any) {
    console.error('Get me error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi kiểm tra phiên làm việc'
    }, { status: 500 });
  }
}
