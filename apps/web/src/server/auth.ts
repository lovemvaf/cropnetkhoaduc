import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'FARMER' | 'ADMIN' | 'LOGISTICS' | 'INSPECTOR';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  isEmailVerified: boolean;
  farmName?: string | null;
  address?: string | null;
}

export async function getUserFromRequest(request: NextRequest): Promise<UserSummary | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {}
      }
    });

    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) return null;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, status')
      .eq('id', authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email || '',
      fullName: profile?.full_name || authUser.user_metadata?.full_name || 'Thành viên CropNet',
      phone: profile?.phone || authUser.user_metadata?.phone || null,
      role: (profile?.role || authUser.user_metadata?.role || 'CUSTOMER') as any,
      status: (profile?.status || 'ACTIVE') as any,
      isEmailVerified: !!authUser.email_confirmed_at,
      farmName: authUser.user_metadata?.farm_name || null,
      address: authUser.user_metadata?.address || null
    };
  } catch (err) {
    console.error('Error getting user from request:', err);
    return null;
  }
}
