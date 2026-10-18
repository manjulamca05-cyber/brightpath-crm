-- ==============================================================================
-- BrightPath CRM — Initial Relational Schema, Constraints, Triggers & RLS Policies
-- Migration: 20261018000001_initial_schema.sql
-- Compatible with: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 PROFILES (1:1 extension of Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'counsellor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_valid_role CHECK (role IN ('admin', 'manager', 'counsellor'))
);

-- 2.2 LEADS (Student inquiries)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    course_interest TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    loss_reason TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_valid_source CHECK (
        source IN ('Website', 'Phone Call', 'WhatsApp', 'Referral', 'Walk-in', 'Other')
    ),
    CONSTRAINT check_valid_status CHECK (
        status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')
    ),
    CONSTRAINT check_loss_reason CHECK (
        (status != 'Lost') OR (status = 'Lost' AND loss_reason IS NOT NULL AND length(trim(loss_reason)) > 0)
    )
);

-- 2.3 FOLLOW_UPS (Scheduled reminders linked to inquiries)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_at TIMESTAMPTZ NOT NULL,
    note TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_valid_followup_status CHECK (
        status IN ('pending', 'completed', 'cancelled')
    )
);

-- 2.4 ACTIVITIES (Audit timeline of lead events)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_status_due ON public.follow_ups(assigned_to, status, due_at);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id_created ON public.activities(lead_id, created_at DESC);

-- ==============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 4.1 Update timestamp helper
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles & leads
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Auto-create profile row on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'BrightPath Team Member'),
        'counsellor' -- Default role is least-privileged
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Secure Role Resolver Function (Bypasses RLS recursion with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------

-- SELECT: Users can read their own profile, managers & admins can view all profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        public.get_current_user_role() IN ('admin', 'manager')
    );

-- UPDATE: Users can update their own profile name, but CANNOT self-promote roles
DROP POLICY IF EXISTS "profiles_user_update_policy" ON public.profiles;
CREATE POLICY "profiles_user_update_policy" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Role cannot be changed by user
    );

-- ADMIN UPDATE: Only admin can modify roles
DROP POLICY IF EXISTS "profiles_admin_update_policy" ON public.profiles;
CREATE POLICY "profiles_admin_update_policy" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.get_current_user_role() = 'admin')
    WITH CHECK (public.get_current_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 5.2 LEADS POLICIES
-- ------------------------------------------------------------------------------

-- SELECT: Counsellor sees created or assigned leads; Managers/Admins see all
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads
    FOR SELECT
    TO authenticated
    USING (
        public.get_current_user_role() IN ('admin', 'manager') OR
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

-- INSERT: Authenticated users can insert leads
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Counsellor can update accessible leads; Managers/Admins can update all
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads
    FOR UPDATE
    TO authenticated
    USING (
        public.get_current_user_role() IN ('admin', 'manager') OR
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    )
    WITH CHECK (
        public.get_current_user_role() IN ('admin', 'manager') OR
        assigned_to = auth.uid() OR
        created_by = auth.uid()
    );

-- DELETE: Only admins can delete leads
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy" ON public.leads
    FOR DELETE
    TO authenticated
    USING (public.get_current_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 5.3 FOLLOW_UPS POLICIES
-- ------------------------------------------------------------------------------

-- SELECT: Inherits lead access
DROP POLICY IF EXISTS "follow_ups_select_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_select_policy" ON public.follow_ups
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = follow_ups.lead_id
            AND (
                public.get_current_user_role() IN ('admin', 'manager') OR
                l.assigned_to = auth.uid() OR
                l.created_by = auth.uid()
            )
        )
    );

-- INSERT: Can add follow-up if user has access to the lead
DROP POLICY IF EXISTS "follow_ups_insert_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_insert_policy" ON public.follow_ups
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = follow_ups.lead_id
            AND (
                public.get_current_user_role() IN ('admin', 'manager') OR
                l.assigned_to = auth.uid() OR
                l.created_by = auth.uid()
            )
        )
    );

-- UPDATE: Can update/complete follow-up if user has access to the lead
DROP POLICY IF EXISTS "follow_ups_update_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_update_policy" ON public.follow_ups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = follow_ups.lead_id
            AND (
                public.get_current_user_role() IN ('admin', 'manager') OR
                l.assigned_to = auth.uid() OR
                l.created_by = auth.uid()
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = follow_ups.lead_id
            AND (
                public.get_current_user_role() IN ('admin', 'manager') OR
                l.assigned_to = auth.uid() OR
                l.created_by = auth.uid()
            )
        )
    );

-- DELETE: Manager and admin can delete follow-ups
DROP POLICY IF EXISTS "follow_ups_delete_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_delete_policy" ON public.follow_ups
    FOR DELETE
    TO authenticated
    USING (public.get_current_user_role() IN ('admin', 'manager'));

-- ------------------------------------------------------------------------------
-- 5.4 ACTIVITIES POLICIES
-- ------------------------------------------------------------------------------

-- SELECT: Inherits lead access
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy" ON public.activities
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = activities.lead_id
            AND (
                public.get_current_user_role() IN ('admin', 'manager') OR
                l.assigned_to = auth.uid() OR
                l.created_by = auth.uid()
            )
        )
    );

-- INSERT: Authenticated users can insert activity logs for accessible leads
DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy" ON public.activities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = activities.lead_id
            AND (
                public.get_current_user_role() IN ('admin', 'manager') OR
                l.assigned_to = auth.uid() OR
                l.created_by = auth.uid()
            )
        )
    );
