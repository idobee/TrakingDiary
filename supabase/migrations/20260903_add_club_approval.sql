-- 1. users 테이블에 system_role 추가
ALTER TABLE public.users 
ADD COLUMN system_role TEXT DEFAULT 'user' CHECK (system_role IN ('admin', 'user'));

-- 2. 특정한 유저에게 admin 권한 부여
UPDATE public.users 
SET system_role = 'admin' 
WHERE id = '8844407c-e52d-4a0e-8cd1-94a4f1bbe0f0';

-- 3. clubs 테이블에 status 컬럼 추가 (디폴트는 pending)
ALTER TABLE public.clubs 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 4. RLS 정책 업데이트 (clubs)
-- 일반 유저는 대기중이거나 거절된 클럽을 제외하고 승인된(approved) 클럽만 조회할 수 있게 하려면 
-- 기존의 누구나 볼 수 있는 정책을 수정해야 합니다. 
-- 여기서는 기존 정책(있는 경우)을 삭제하고 새로 정의합니다.
DROP POLICY IF EXISTS "Anyone can view clubs" ON public.clubs;

-- 관리자(admin)는 모든 클럽을 볼 수 있고, 일반 사용자는 승인된(approved) 클럽만 볼 수 있습니다.
-- 혹은 자신이 개설 신청한(owner_id) 클럽은 승인 상태와 무관하게 볼 수 있습니다.
CREATE POLICY "View clubs policy" 
ON public.clubs FOR SELECT 
USING (
  status = 'approved' OR 
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND system_role = 'admin')
);

-- 누구나 클럽 개설 신청(insert)은 가능합니다.
CREATE POLICY "Users can create clubs" 
ON public.clubs FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- 관리자(admin)만이 클럽의 상태를 수정(update)할 수 있습니다.
-- (예외적으로 신청자가 자신의 신청서를 수정할 수도 있겠지만, 여기서는 관리자 승인 용도로만 제한)
CREATE POLICY "Admins can update clubs" 
ON public.clubs FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND system_role = 'admin')
);
