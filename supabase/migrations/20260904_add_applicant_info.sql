ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS applicant_id TEXT,
ADD COLUMN IF NOT EXISTS applicant_name TEXT;
