import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Chỉ Quản trị viên mới có quyền phê duyệt' }, { status: 403 });
    }

    const adminClient = createAdminClient() || supabase;

    // Update supplier_profiles and profiles
    await adminClient
      .from('supplier_profiles')
      .update({
        status: 'APPROVED',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('profile_id', id);

    await adminClient
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Đã phê duyệt tài khoản nhà vườn thành công!'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
