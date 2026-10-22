-- ============================================================================
-- Migration: 01_init.sql (Refined & Idempotent)
-- Target Administrator: syedaman996455@gmail.com
-- ============================================================================

-- 1. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT DEFAULT '',
    employment_type TEXT DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Internship', 'Contract', 'Part-time')),
    source TEXT DEFAULT 'Other',
    salary TEXT DEFAULT '',
    job_url TEXT DEFAULT '',
    job_description TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    next_follow_up DATE,
    next_follow_up_note TEXT DEFAULT '',
    next_follow_up_done BOOLEAN DEFAULT FALSE,
    interview_date TIMESTAMPTZ,
    interview_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indices for performant querying and filtering
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON public.applications(date DESC);
CREATE INDEX IF NOT EXISTS idx_applications_company ON public.applications(LOWER(company));

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON public.applications;
CREATE TRIGGER trigger_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 5. Explicit table permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
REVOKE ALL ON public.applications FROM anon;

-- 6. Strict Single-Admin Access Policies (Idempotent)

-- SELECT: Only syedaman996455@gmail.com can read applications
DROP POLICY IF EXISTS "Admin exclusive SELECT access" ON public.applications;
CREATE POLICY "Admin exclusive SELECT access"
ON public.applications
FOR SELECT
TO authenticated
USING (
    (auth.jwt() ->> 'email') = 'syedaman996455@gmail.com'
);

-- INSERT: Only syedaman996455@gmail.com can insert applications
DROP POLICY IF EXISTS "Admin exclusive INSERT access" ON public.applications;
CREATE POLICY "Admin exclusive INSERT access"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() ->> 'email') = 'syedaman996455@gmail.com'
    AND (user_id = auth.uid() OR user_id IS NULL)
);

-- UPDATE: Only syedaman996455@gmail.com can update applications
DROP POLICY IF EXISTS "Admin exclusive UPDATE access" ON public.applications;
CREATE POLICY "Admin exclusive UPDATE access"
ON public.applications
FOR UPDATE
TO authenticated
USING (
    (auth.jwt() ->> 'email') = 'syedaman996455@gmail.com'
)
WITH CHECK (
    (auth.jwt() ->> 'email') = 'syedaman996455@gmail.com'
);

-- DELETE: Only syedaman996455@gmail.com can delete applications
DROP POLICY IF EXISTS "Admin exclusive DELETE access" ON public.applications;
CREATE POLICY "Admin exclusive DELETE access"
ON public.applications
FOR DELETE
TO authenticated
USING (
    (auth.jwt() ->> 'email') = 'syedaman996455@gmail.com'
);
