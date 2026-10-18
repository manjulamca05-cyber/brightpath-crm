-- ==============================================================================
-- BrightPath CRM — Setup Verification Queries
-- Run these queries in Supabase SQL Editor after applying the migration.
-- ==============================================================================

-- 1. Verify all 4 tables exist and have Row Level Security ENABLED
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'leads', 'follow_ups', 'activities')
ORDER BY tablename;
-- Expected output: 4 rows with rls_enabled = true.

-- 2. Verify all active RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd AS operation,
    roles
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'leads', 'follow_ups', 'activities')
ORDER BY tablename, cmd;
-- Expected output: List of policies covering SELECT, INSERT, UPDATE, DELETE.

-- 3. Verify triggers are created
SELECT 
    event_object_table AS table_name,
    trigger_name,
    event_manipulation AS event,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
  AND trigger_name IN ('trigger_profiles_updated_at', 'trigger_leads_updated_at', 'on_auth_user_created');
-- Expected output: 3 triggers active.

-- 4. Verify loss_reason constraint is enforced
-- (This should FAIL with a check constraint violation if run without a loss_reason)
-- INSERT INTO public.leads (full_name, phone, course_interest, source, status) 
-- VALUES ('Test Student', '+91 99999 99999', 'NEET', 'Website', 'Lost');
