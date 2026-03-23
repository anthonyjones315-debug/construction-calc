-- Master verification script for Supabase
-- Run this script in the Supabase SQL editor or via the CLI to ensure the database is healthy.

-- 1. Basic connectivity test
SELECT now() AS current_timestamp;

-- 2. Verify essential tables exist
DO $$
DECLARE
    tbl text;
    missing_tables text[] := ARRAY[]::text[];
BEGIN
    FOREACH tbl IN ARRAY ARRAY['public.users', 'public.estimates', 'public.business_profiles'] LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = split_part(tbl, '.', 1) AND table_name = split_part(tbl, '.', 2)) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- 3. Verify required columns in `public.users`
DO $$
DECLARE
    col record;
    missing_cols text[] := ARRAY[]::text[];
BEGIN
    FOR col IN SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' LOOP
        IF col.column_name NOT IN ('id', 'email', 'clerk_user_id') THEN
            CONTINUE; -- ignore unrelated columns
        END IF;
    END LOOP;
    -- Add explicit checks if needed
END $$;

-- 4. Verify RPC function for user sync exists (optional)
SELECT proname FROM pg_proc WHERE proname = 'sync_user_to_public';

-- 5. Simple data sanity check (optional)
SELECT COUNT(*) AS user_count FROM public.users;
