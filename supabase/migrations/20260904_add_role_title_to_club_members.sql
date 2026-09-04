-- club_members 테이블에 role_title 컬럼 추가 (별칭: 총무, 부회장 등)
ALTER TABLE public.club_members 
ADD COLUMN IF NOT EXISTS role_title TEXT;

-- 기존 데이터 초기화 (부관리자/모임장이 아닌 경우 NULL)
COMMENT ON COLUMN public.club_members.role_title IS '동호회 내 사용자의 별칭 또는 구체적인 직함 (예: 총무, 등반대장)';
