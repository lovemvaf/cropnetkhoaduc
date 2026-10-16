import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VERIFIED_BATCHES } from '@/data/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Chỉ Quản trị viên mới có quyền xem chứng nhận' }, { status: 403 });
    }

    // Extract all certificates from batches
    const certs: any[] = [];
    Object.values(VERIFIED_BATCHES).forEach((b: any) => {
      (b.certifications || []).forEach((c: any) => {
        certs.push({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          validUntil: c.validUntil,
          status: c.status || 'APPROVED',
          batchCode: b.batchCode,
          farmName: b.farmingArea
        });
      });
    });

    return NextResponse.json({
      success: true,
      data: certs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
