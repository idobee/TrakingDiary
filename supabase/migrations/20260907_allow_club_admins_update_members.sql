-- 동호회 운영진(owner, admin)도 club_members 상태 및 역할을 변경할 수 있도록 RLS 정책 추가/개선

-- 1. UPDATE 정책: 시스템 관리자 또는 해당 동호회의 승인된 모임장/운영진 허용
DROP POLICY IF EXISTS "System Admins can update club members" ON public.club_members;
DROP POLICY IF EXISTS "Club admins and system admins can update club members" ON public.club_members;

CREATE POLICY "Club admins and system admins can update club members"
ON public.club_members
FOR UPDATE
USING (
  -- 1) 시스템 관리자
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND system_role IN ('admin', 'sys_admin')
  )
  OR
  -- 2) 해당 동호회의 승인된 모임장 또는 운영진
  EXISTS (
    SELECT 1 FROM public.club_members cm
    WHERE cm.club_id = club_members.club_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'approved'
  )
);

-- 2. DELETE 정책: 시스템 관리자 또는 해당 동호회의 승인된 모임장/운영진 허용 (모임장 제외)
DROP POLICY IF EXISTS "Club admins and system admins can delete club members" ON public.club_members;

CREATE POLICY "Club admins and system admins can delete club members"
ON public.club_members
FOR DELETE
USING (
  -- 1) 시스템 관리자
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND system_role IN ('admin', 'sys_admin')
  )
  OR
  -- 2) 해당 동호회의 승인된 모임장 또는 운영진 (단, 모임장은 삭제 불가)
  (
    club_members.role <> 'owner'
    AND EXISTS (
      SELECT 1 FROM public.club_members cm
      WHERE cm.club_id = club_members.club_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
        AND cm.status = 'approved'
    )
  )
);
