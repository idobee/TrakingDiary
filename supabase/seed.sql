-- ==============================================================================
-- 🏔️ 함께쓰는 Tracking 일기 - Seed Data Script
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에 붙여넣고 실행하세요.
-- 기존 데이터가 있다면 충돌할 수 있으므로 테스트용/빈 DB에서 실행하는 것을 권장합니다.
-- ==============================================================================

-- 1. 사용자 데이터 (auth.users & public.users)
-- (주의: 본인 계정으로 이미 가입했다면, 아래 UUID 중 하나를 본인의 UUID로 바꾸시면 됩니다)
DO $$ 
DECLARE
  user1_id UUID := '11111111-1111-1111-1111-111111111111'; -- 고수 (모임장)
  user2_id UUID := '22222222-2222-2222-2222-222222222222'; -- 초보
  user3_id UUID := '33333333-3333-3333-3333-333333333333'; -- 일반 회원
  club1_id BIGINT;
  club2_id BIGINT;
  hike1_id BIGINT;
  hike2_id BIGINT;
  badge1_id BIGINT;
BEGIN

  -- A. auth.users 에 더미 사용자 삽입 (Supabase 인증 시스템 우회 삽입)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  (user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'leader@trek.com', 'dummy', NOW(), '{"provider":"kakao"}', '{"name":"이등산"}', NOW(), NOW()),
  (user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'newbie@trek.com', 'dummy', NOW(), '{"provider":"google"}', '{"name":"김산길"}', NOW(), NOW()),
  (user3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member@trek.com', 'dummy', NOW(), '{"provider":"naver"}', '{"name":"박트렉"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- B. public.users 에 사용자 메타데이터 삽입
  INSERT INTO public.users (id, email, nickname, provider, provider_id, character_type)
  VALUES 
  (user1_id, 'leader@trek.com', '이등산', 'kakao', 'kakao_1', 'expert'),
  (user2_id, 'newbie@trek.com', '김산길', 'google', 'google_2', 'beginner'),
  (user3_id, 'member@trek.com', '박트렉', 'naver', 'naver_3', 'medium')
  ON CONFLICT (id) DO NOTHING;

  -- 2. 동호회 데이터 (clubs)
  INSERT INTO public.clubs (owner_id, name, category, description)
  VALUES 
  (user1_id, '국립공원 산악회', 'hiking', '전국 국립공원 명산을 정복하고 사진과 일기를 아카이빙하는 전통 산악 동호회입니다.')
  RETURNING id INTO club1_id;

  INSERT INTO public.clubs (owner_id, name, category, description)
  VALUES 
  (user2_id, '주말 힐링 트레킹', 'general', '가벼운 둘레길과 치유의 숲길을 걸으며 일상의 피로를 푸는 주말 모임입니다.')
  RETURNING id INTO club2_id;

  -- 3. 동호회 멤버 (club_members)
  INSERT INTO public.club_members (club_id, user_id, role, status, approved_at)
  VALUES 
  (club1_id, user1_id, 'owner', 'approved', NOW()),
  (club1_id, user2_id, 'member', 'approved', NOW()),
  (club1_id, user3_id, 'member', 'pending', NULL), -- 가입 대기중 회원
  (club2_id, user2_id, 'owner', 'approved', NOW())
  ON CONFLICT DO NOTHING;

  -- 4. 뱃지 데이터 (badges)
  INSERT INTO public.badges (club_id, name, icon_name, description)
  VALUES 
  (club1_id, '천왕봉 완등', '🏔️', '지리산 천왕봉 등반 완료'),
  (club1_id, '백운대 일출', '🌙', '북한산 백운대 야간 일출 감상')
  RETURNING id INTO badge1_id;

  -- 5. 산행 모집 데이터 (hikes)
  INSERT INTO public.hikes (club_id, organizer_id, title, mountain_name, hike_date, difficulty, status, description)
  VALUES 
  (club1_id, user1_id, '지리산 천왕봉 종주', '지리산', NOW() - INTERVAL '7 days', 'hard', 'completed', '장터목 대피소 1박 • 모집인원 8/12명')
  RETURNING id INTO hike1_id;

  INSERT INTO public.hikes (club_id, organizer_id, title, mountain_name, hike_date, difficulty, status, description)
  VALUES 
  (club1_id, user1_id, '북한산 백운대 야간 일출', '북한산', NOW() + INTERVAL '14 days', 'medium', 'recruiting', '새벽 4시 등반 • 모집인원 6/10명')
  RETURNING id INTO hike2_id;

  -- 6. 산행 멤버 (hike_members)
  INSERT INTO public.hike_members (hike_id, user_id, role, status, completed_at)
  VALUES 
  (hike1_id, user1_id, 'organizer', 'completed', NOW()),
  (hike1_id, user2_id, 'member', 'completed', NOW()),
  (hike2_id, user1_id, 'organizer', 'approved', NULL),
  (hike2_id, user2_id, 'member', 'applied', NULL) -- 신청만 한 상태
  ON CONFLICT DO NOTHING;

  -- 7. 유저 뱃지 획득 (user_badges)
  INSERT INTO public.user_badges (user_id, badge_id, hike_id, granted_by)
  VALUES 
  (user2_id, badge1_id, hike1_id, user1_id)
  ON CONFLICT DO NOTHING;

  -- 8. 에피소드 / 일기 (episodes)
  INSERT INTO public.episodes (hike_id, author_id, title, content, is_published)
  VALUES 
  (hike1_id, user2_id, '지리산 천왕봉 정상을 밟으며', '새벽 4시, 장터목 대피소의 차가운 바람을 뚫고 오른 천왕봉 정상. 붉게 물드는 운해를 바라보며 모임원들과 함께 끓여 마신 따뜻한 차 한 잔의 기쁨은 그 무엇과도 바꿀 수 없었다.', true),
  (hike1_id, user1_id, '장터목 대피소의 별빛과 추억', '장터목 대피소에 모여 나누었던 온기... 지리산의 차가운 밤바람도 따뜻한 차 한 잔과 모임원들의 웃음소리 앞에서는 사르르 녹아내렸습니다.', true);

END $$;
