-- 20260908_add_hike_type_to_hikes.sql
-- 산행(hikes) 테이블에 정모('regular')와 벙개('lightning') 구분을 위한 hike_type 컬럼 추가

ALTER TABLE public.hikes 
ADD COLUMN IF NOT EXISTS hike_type TEXT DEFAULT 'regular' CHECK (hike_type IN ('regular', 'lightning'));

COMMENT ON COLUMN public.hikes.hike_type IS '모임 구분 (정모: regular, 벙개: lightning)';

-- 기존 레코드 중 제목에 '벙개' 또는 '번개'가 포함된 경우 'lightning'으로 자동 업데이트
UPDATE public.hikes 
SET hike_type = 'lightning' 
WHERE (title ILIKE '%벙개%' OR title ILIKE '%번개%') AND (hike_type IS NULL OR hike_type = 'regular');
