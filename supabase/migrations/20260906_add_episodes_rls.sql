-- 에피소드 테이블 RLS 정책 (조회, 등록, 수정, 삭제)

-- 1. 누구나 에피소드를 볼 수 있음
CREATE POLICY "Anyone can view episodes" 
ON public.episodes 
FOR SELECT 
USING (true);

-- 2. 로그인한 사용자 본인의 에피소드만 등록 가능
CREATE POLICY "Users can insert episodes" 
ON public.episodes 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- 3. 본인이 작성한 에피소드만 수정 가능
CREATE POLICY "Users can update their own episodes" 
ON public.episodes 
FOR UPDATE 
USING (auth.uid() = author_id);

-- 4. 본인이 작성한 에피소드만 삭제 가능
CREATE POLICY "Users can delete their own episodes" 
ON public.episodes 
FOR DELETE 
USING (auth.uid() = author_id);
