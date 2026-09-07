-- hikes 테이블에 cover_image_url 컬럼 추가
ALTER TABLE public.hikes 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN public.hikes.cover_image_url IS '트레킹 일정 팝업 및 카드에 표시될 커버 이미지 URL';
