-- Hikes 테이블 RLS 정책
CREATE POLICY "Anyone can view hikes"
ON public.hikes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own hikes"
ON public.hikes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their hikes"
ON public.hikes FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their hikes"
ON public.hikes FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id);

-- Hike_members 테이블 RLS 정책
CREATE POLICY "Anyone can view hike members"
ON public.hike_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join hikes or organizers can add members"
ON public.hike_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR 
  EXISTS (SELECT 1 FROM public.hikes WHERE id = hike_members.hike_id AND organizer_id = auth.uid())
);

CREATE POLICY "Users can update their own status or organizers can manage"
ON public.hike_members FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (SELECT 1 FROM public.hikes WHERE id = hike_members.hike_id AND organizer_id = auth.uid())
);

CREATE POLICY "Users can leave or organizers can remove"
ON public.hike_members FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (SELECT 1 FROM public.hikes WHERE id = hike_members.hike_id AND organizer_id = auth.uid())
);
