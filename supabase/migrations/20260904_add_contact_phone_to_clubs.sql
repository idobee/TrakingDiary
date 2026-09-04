-- public.clubs 테이블에 contact_phone 컬럼 추가
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS contact_phone TEXT;
