import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      return NextResponse.json({ success: false, error: 'Chỉ Quản trị viên mới có quyền xem thống kê' }, { status: 403 });
    }

    const stats = {
      totalRevenue: 285400000,
      totalOrders: 142,
      activeFarmers: 18,
      totalConsumers: 1250,
      revenueTrends: [
        { date: '10/10', revenue: 32000000 },
        { date: '11/10', revenue: 45000000 },
        { date: '12/10', revenue: 38000000 },
        { date: '13/10', revenue: 52000000 },
        { date: '14/10', revenue: 49000000 },
        { date: '15/10', revenue: 69400000 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
