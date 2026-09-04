-- 1. Migrate existing 'member' roles to 'regular'
UPDATE public.club_members SET role = 'regular' WHERE role = 'member';

-- 2. Drop the old check constraint (We need to find the name first, or use a generic approach)
-- In Postgres, constraints created like `role TEXT CHECK (role IN (...))` are auto-named table_column_check.
-- So it's usually `club_members_role_check`.
ALTER TABLE public.club_members DROP CONSTRAINT IF EXISTS club_members_role_check;

-- 3. Add the new check constraint
ALTER TABLE public.club_members ADD CONSTRAINT club_members_role_check CHECK (role IN ('owner', 'admin', 'regular', 'guest'));
