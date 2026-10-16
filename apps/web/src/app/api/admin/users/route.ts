import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: false, error: 'Database chưa được cấu hình' }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 });
    }

    // Verify ADMIN role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Không có quyền Quản trị viên (403 Forbidden)' }, { status: 403 });
    }

    // Use admin client to query all users
    const adminClient = createAdminClient() || supabase;
    const { data: users, error } = await adminClient
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        status,
        created_at,
        supplier_profiles (
          farm_name,
          address,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Map output for admin dashboard UI
    const mapped = (users || []).map((u: any) => {
      const sp = Array.isArray(u.supplier_profiles) ? u.supplier_profiles[0] : u.supplier_profiles;
      return {
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        phone: u.phone,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
        farmName: sp?.farm_name || null,
        address: sp?.address || null,
        supplierStatus: sp?.status || (u.role === 'FARMER' ? u.status : null)
      };
    });

    const response = NextResponse.json({
      success: true,
      data: mapped
    });
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    return response;

  } catch (err: any) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
