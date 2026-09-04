-- 1. Users Table (auth.users 연동 - Kakao, Google 등 Social OAuth 회원가입만 허용)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('kakao', 'google', 'naver', 'oauth')),
  provider_id TEXT,
  character_type TEXT DEFAULT 'beginner',
  system_role TEXT DEFAULT 'user' CHECK (system_role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clubs Table (동호회 메타데이터 & 구글드라이브/AI API 키 연동)
CREATE TABLE IF NOT EXISTS public.clubs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hiking', 'running', 'cycling', 'tracking', 'general')),
  description TEXT,
  logo_url TEXT,
  google_drive_folder_id TEXT,
  google_drive_credentials_json TEXT,
  gemini_api_key TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Club Members Table (동호회 가입 신청 및 관리자 승인)
CREATE TABLE IF NOT EXISTS public.club_members (
  club_id BIGINT REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  PRIMARY KEY (club_id, user_id)
);

-- 4. Hikes Table (산행 모집 및 일정 - 동호회 연동)
CREATE TABLE IF NOT EXISTS public.hikes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  club_id BIGINT REFERENCES public.clubs(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mountain_name TEXT NOT NULL,
  hike_date TIMESTAMPTZ NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hike Members Table (산행 참가자 신청상태 및 참여완료 관리)
CREATE TABLE IF NOT EXISTS public.hike_members (
  hike_id BIGINT REFERENCES public.hikes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'completed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (hike_id, user_id)
);

-- 6. Episodes Table (함께 쓰는 일기/에피소드 - 다중 사진 링크 배열 저장)
CREATE TABLE IF NOT EXISTS public.episodes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  hike_id BIGINT NOT NULL REFERENCES public.hikes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_urls TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Photos Table (Google Shared Drive 연동 사진 metadata)
CREATE TABLE IF NOT EXISTS public.photos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  hike_id BIGINT NOT NULL REFERENCES public.hikes(id) ON DELETE CASCADE,
  episode_id BIGINT REFERENCES public.episodes(id) ON DELETE SET NULL,
  uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  google_drive_file_id TEXT NOT NULL,
  google_drive_web_link TEXT NOT NULL,
  thumbnail_url TEXT,
  is_bside BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Badges Table (완등/참여 뱃지 정의)
CREATE TABLE IF NOT EXISTS public.badges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  club_id BIGINT REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. User Badges Table (하이킹 참여자 뱃지 수여 - 동호회 관리자 부여)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  hike_id BIGINT REFERENCES public.hikes(id) ON DELETE SET NULL,
  granted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, badge_id, hike_id)
);

-- Row Level Security (RLS) Enable
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hike_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 관리자 권한 부여
UPDATE public.users SET system_role = 'admin' WHERE id = '8844407c-e52d-4a0e-8cd1-94a4f1bbe0f0';

-- Clubs 정책 설정
DROP POLICY IF EXISTS "View clubs policy" ON public.clubs;
CREATE POLICY "View clubs policy" ON public.clubs FOR SELECT USING (status = 'approved' OR auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND system_role = 'admin'));

DROP POLICY IF EXISTS "Users can create clubs" ON public.clubs;
CREATE POLICY "Users can create clubs" ON public.clubs FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can update clubs" ON public.clubs;
CREATE POLICY "Admins can update clubs" ON public.clubs FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND system_role = 'admin'));

-- Club Members 정책 (가입 신청을 위해 INSERT 허용 필요)
DROP POLICY IF EXISTS "Users can view club members" ON public.club_members;
CREATE POLICY "Users can view club members" ON public.club_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can apply for club membership" ON public.club_members;
CREATE POLICY "Users can apply for club membership" ON public.club_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System Admins can update club members" ON public.club_members;
CREATE POLICY "System Admins can update club members" ON public.club_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND system_role = 'admin'));
