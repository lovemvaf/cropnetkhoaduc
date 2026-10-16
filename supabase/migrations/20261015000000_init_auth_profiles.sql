-- ================================================================
-- CROPNET ĐỒNG NAI AI - SUPABASE POSTGRESQL MIGRATION
-- Migration: 20261015000000_init_auth_profiles.sql
-- Mô tả: Khởi tạo bảng profiles, supplier_profiles, RBAC triggers,
--        RLS policies, forum, orders bền vững.
-- ================================================================

-- 1. Create custom ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'FARMER', 'ADMIN', 'LOGISTICS', 'INSPECTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create public.profiles table (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create public.supplier_profiles table
CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    address TEXT NOT NULL,
    verification_evidence JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create persistent Forum & Orders tables
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL DEFAULT 'CUSTOMER',
    likes INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'ANNOUNCEMENT',
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    tags TEXT[] NOT NULL DEFAULT '{}',
    views_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    parent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.forum_likes (
    post_id TEXT NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    shipping_fee NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_method TEXT NOT NULL DEFAULT 'COD',
    payment_status TEXT NOT NULL DEFAULT 'UNPAID',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Helper function: Check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to automatically provision public.profiles when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role public.user_role := 'CUSTOMER';
    assigned_status public.user_status := 'ACTIVE';
    input_role TEXT;
    v_farm_name TEXT;
    v_address TEXT;
BEGIN
    -- Extract role safely from metadata (Case-insensitive)
    input_role := UPPER(COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER'));

    -- Guardrail: Only CUSTOMER or FARMER allowed on public self-registration
    -- Attempting ADMIN, INSPECTOR, LOGISTICS will be clamped to CUSTOMER
    IF input_role = 'FARMER' THEN
        assigned_role := 'FARMER';
        assigned_status := 'PENDING';
    ELSE
        assigned_role := 'CUSTOMER';
        assigned_status := 'ACTIVE';
    END IF;

    -- Upsert profile
    INSERT INTO public.profiles (id, email, full_name, phone, role, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'phone',
        assigned_role,
        assigned_status
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = timezone('utc'::text, now());

    -- If applicant is FARMER, create pending supplier application
    IF assigned_role = 'FARMER' THEN
        v_farm_name := COALESCE(new.raw_user_meta_data->>'farm_name', 'Nhà vườn mới đăng ký');
        v_address := COALESCE(new.raw_user_meta_data->>'address', 'Tỉnh Đồng Nai');

        INSERT INTO public.supplier_profiles (profile_id, farm_name, address, status)
        VALUES (new.id, v_farm_name, v_address, 'PENDING')
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. Define RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile or admin view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own contact info only" ON public.profiles;
CREATE POLICY "Users can update own contact info only"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin());

-- 9. Define RLS Policies for Supplier Profiles
DROP POLICY IF EXISTS "Suppliers view own profile or admin view all" ON public.supplier_profiles;
CREATE POLICY "Suppliers view own profile or admin view all"
    ON public.supplier_profiles FOR SELECT
    USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Only admin can update supplier approval" ON public.supplier_profiles;
CREATE POLICY "Only admin can update supplier approval"
    ON public.supplier_profiles FOR UPDATE
    USING (public.is_admin());

-- 10. Define RLS Policies for Forum
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.forum_posts;
CREATE POLICY "Anyone can view published posts"
    ON public.forum_posts FOR SELECT
    USING (status = 'PUBLISHED' OR author_id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can create posts"
    ON public.forum_posts FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view published comments" ON public.forum_comments;
CREATE POLICY "Anyone can view published comments"
    ON public.forum_comments FOR SELECT
    USING (status = 'PUBLISHED' OR author_id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.forum_comments;
CREATE POLICY "Authenticated users can comment"
    ON public.forum_comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 11. Define RLS Policies for Orders
DROP POLICY IF EXISTS "Customers can view own orders, admin views all" ON public.orders;
CREATE POLICY "Customers can view own orders, admin views all"
    ON public.orders FOR SELECT
    USING (customer_id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);
