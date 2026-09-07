# 🏛️ 함께쓰는 Tracking 일기 프로젝트 개발 규칙 (AGENTS.md)

본 지침서는 **함께쓰는 Tracking 일기 (산행 추억 아카이브)** 웹 프로젝트의 개발 아키텍처 규격, 데이터베이스 구조, 기술 스택 지침 및 코드 작성 스탠다드를 정의합니다.

---

## 1. ⚙️ 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Design Tokens**: `tracking-diary-stitch` 스킬 레퍼런스 준수
  - Headings: `Bricolage Grotesque`
  - Body: `Be Vietnam Pro`
  - Data Labels: `Space Grotesk`
- **Backend / Database**: Supabase (PostgreSQL, Auth, Realtime)
- **External Storage**: Google Shared Drive API v3 (Service Account 기반 이미지 저장)

---

## 2. 🗄️ Supabase DDL SQL Schema

```sql
-- 1. Users Table (auth.users 연동 - Kakao, Google 등 Social OAuth 회원가입만 허용)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('kakao', 'google', 'naver', 'oauth')), -- OAuth 소셜 로그인 제공자
  provider_id TEXT, -- OAuth 고유 식별자
  character_type TEXT DEFAULT 'beginner',
  system_role TEXT DEFAULT 'user' CHECK (system_role IN ('admin', 'user')), -- 사용자 권한
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clubs Table (동호회 메타데이터 & 구글드라이브/AI API 키 연동)
CREATE TABLE public.clubs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, -- Sequential Max ID (user_id 외 정수 PK)
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hiking', 'running', 'cycling', 'tracking', 'general')),
  description TEXT,
  logo_url TEXT,
  google_drive_folder_id TEXT, -- 해당 동호회 전용 구글 공유 드라이브 폴더 ID
  google_drive_credentials_json TEXT, -- 서비스 계정 인증 JSON
  gemini_api_key TEXT, -- AI 에피소드 윤색 및 맥락 분석용 Gemini API Key
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- 관리자 승인 상태
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Club Members Table (동호회 가입 신청 및 관리자 승인)
CREATE TABLE public.club_members (
  club_id BIGINT REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')), -- 동호회 관리자 권한 지정 (owner, admin, member)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  PRIMARY KEY (club_id, user_id)
);

-- 4. Hikes Table (산행 모집 및 일정 - 동호회 연동)
CREATE TABLE public.hikes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, -- Sequential Max ID
  club_id BIGINT REFERENCES public.clubs(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mountain_name TEXT NOT NULL,
  hike_date TIMESTAMPTZ NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'completed', 'cancelled')),
  description TEXT,
  cover_image_url TEXT,
  google_drive_folder_id TEXT, -- 해당 트레킹 모임 전용 구글 드라이브 서브 폴더 ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hike Members Table (산행 참가자 신청상태 및 참여완료 관리)
CREATE TABLE public.hike_members (
  hike_id BIGINT REFERENCES public.hikes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'completed')), -- 신청상태(applied), 승인(approved), 거절(rejected), 참여완료(completed)
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ, -- 참여완료 일시
  PRIMARY KEY (hike_id, user_id)
);

-- 6. Episodes Table (함께 쓰는 일기/에피소드 - 다중 사진 링크 배열 저장)
CREATE TABLE public.episodes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, -- Sequential Max ID
  hike_id BIGINT NOT NULL REFERENCES public.hikes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_urls TEXT[], -- 관련 사진 링크 여러 개 배열 저장 (Multi-Photo Links)
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Photos Table (Google Shared Drive 연동 사진 metadata)
CREATE TABLE public.photos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, -- Sequential Max ID
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
CREATE TABLE public.badges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, -- Sequential Max ID
  club_id BIGINT REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. User Badges Table (하이킹 참여자 뱃지 수여 - 동호회 관리자 부여)
CREATE TABLE public.user_badges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, -- Sequential Max ID
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
```

---

## 3. 📂 Google Shared Drive 연동 규격

1. **서비스 계정(Service Account) 인증**: Backend API Route (`/api/drive/upload`)에서 OAuth JWT Client로 Google Shared Drive 접근 권한 획득.
2. **폴더 구조화 (첨부파일 관리 기본 지침)**: 
   - 처음 이미지를 업로드할 때, 해당 트레킹의 **예정 날짜(YYYY-MM-DD)**를 이름으로 하는 서브 폴더를 동호회 구글 드라이브 내에 자동 생성합니다.
   - 만약 동일한 일자 이름의 폴더가 이미 존재한다면, 뒤에 `(1)`, `(2)` 등 숫자를 붙여 폴더명을 구분하여 생성합니다 (예: `2026-09-05 (1)`).
   - 이후 해당 트레킹 모임과 관련된 모든 이미지는 위에서 배정된 전용 서브 폴더에 저장됩니다.
3. **메타데이터 저장**: 원본 파일은 구글 공유 드라이브에 저장하고, URL 및 File ID, 그리고 생성된 서브 폴더의 ID를 Supabase 데이터베이스에 기록하여 재사용합니다.

---

## 4. 📐 프론트엔드 디렉터리 아키텍처 (플랫 TSX 파일 명명 규칙)

```
src/
├── app/                         # 서브디렉터리 없이 디렉터리명 접두사 붙인 플랫 TSX 파일
│   ├── dashboard_page.tsx       # [UC1] 대시보드 메인
│   ├── hikes_page.tsx           # [UC2] 트레킹모집 목록
│   ├── hikes_id_page.tsx        # [UC7] 3개월 주차별 일정표
│   ├── diaries_page.tsx         # [UC3] 트레킹앨범 (단행본 서가)
│   ├── diaries_id_page.tsx      # [UC8] 트레킹일기 상세 ([UC10] 에피소드 + [UC11] 에피소드등록)
│   ├── gallery_page.tsx         # [UC9] 사진첩 & [UC12] 사진등록 (Google Drive 연동)
│   ├── my_page.tsx              # [UC4] 마이트레킹 메인
│   ├── my_badges_page.tsx       # [UC5] 나의뱃지 ([UC6] 뱃지부여 연동)
│   ├── my_activities_page.tsx   # [UC13] 활동기록 (타임라인)
│   ├── clubs_page.tsx           # [UC14] 동호회현황 목록 & 초청링크 가입 관리자 승인
│   ├── clubs_new_page.tsx       # [UC15] 동호회개설 신청
│   └── api/                     # Supabase & Google Drive API 라우트
├── components/                  # Stitch 디자인 토큰 기반 재사용 UI 컴포넌트
│   ├── ui/                      # Button, Card, Badge 등 원자 컴포넌트
│   ├── polaroid/                # 폴라로이드 사진 카드 컴포넌트
│   └── stamp/                   # 완등 스탬프 컴포넌트
├── lib/                         # Supabase 클라이언트 & Google Drive API 헬퍼
│   ├── supabase/
│   └── google-drive/
├── locales/                     # 🌐 i18n 다국어 JSON (ko.json, en.json)
│   ├── ko.json                  # 한국어 텍스트 번역
│   └── en.json                  # 영문 텍스트 번역
└── types/                       # TypeScript 인터페이스 (Supabase DB Types)
```

---

## 5. 🌐 i18n 다국어 텍스트 관리 기초기술지침

본 프로젝트는 **한국어(ko) / 영문(en) 이중 언어**를 지원합니다. 모든 UI 텍스트는 JSON 파일로 관리하며, 컴포넌트에 텍스트를 하드코딩하는 것을 금지합니다.

### 5.1 핵심 원칙 (Mandatory Rules)

1. **하드코딩 금지**: 모든 UI 레이블, 메뉴, 버튼 텍스트, 안내문구, 모달 메시지, alert 텍스트는 반드시 `ko.json`/`en.json`에 등록 후 `t()` 함수로 참조합니다.
2. **JSON 우선 등록**: 새 화면(page) 또는 컴포넌트 생성 시, **코드 작성 전에** `ko.json`과 `en.json`에 해당 텍스트 키를 먼저 등록합니다.
3. **동적 데이터 예외**: DB에서 조회되는 동적 데이터(산 이름, 동호회명, 사용자 닉네임 등)는 JSON에 포함하지 않습니다. UI 고정 텍스트만 JSON으로 관리합니다.
4. **키 동기화**: `ko.json`과 `en.json`의 키 구조는 반드시 100% 동일하게 유지합니다. 한쪽에만 키를 추가하는 것을 금지합니다.

### 5.2 JSON 키 네이밍 컨벤션

```
{페이지명}.{섹션명}.{요소명}
```

- **페이지명**: `common`, `header`, `footer`, `dashboard`, `diaries`, `my`, `clubs`, `gallery`, `modal`
- **섹션명**: 페이지 내 논리적 영역 (예: `hero`, `metrics`, `tabs`, `admin`)
- **요소명**: 구체적 UI 요소 (예: `title`, `description`, `button`, `label`)

**예시:**
```json
{
  "dashboard": {
    "heroTitle": "함께 발맞춘 산길...",
    "metricsUpcomingLabel": "Upcoming Hikes",
    "heroCtaHikes": "⛰️ 트레킹 모집 둘러보기"
  }
}
```

### 5.3 인프라 파일 구조

```
src/
├── locales/
│   ├── ko.json          # 한국어 번역 JSON
│   └── en.json          # 영문 번역 JSON
└── lib/
    └── i18n.tsx         # I18nProvider, useTranslation(), LanguageSwitcher
```

### 5.4 사용법 (Usage Pattern)

```tsx
'use client'
import { useTranslation } from '@/lib/i18n'

export const MyComponent = () => {
  const { t, locale, setLocale } = useTranslation()

  return (
    <div>
      {/* 기본 텍스트 */}
      <h1>{t('header.appTitle')}</h1>

      {/* 변수 보간 (interpolation) */}
      <span>{t('modal.episode.likesCount', { count: 12 })}</span>
      {/* ko: "❤️ 좋아요 12개" / en: "❤️ 12 Likes" */}

      {/* 언어 전환 */}
      <button onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}>
        {locale === 'ko' ? '🇺🇸 English' : '🇰🇷 한국어'}
      </button>
    </div>
  )
}
```

### 5.5 새 화면 생성 시 i18n 체크리스트

1. ✅ `ko.json`에 페이지 네임스페이스 키 등록
2. ✅ `en.json`에 동일 구조로 영문 번역 등록
3. ✅ 컴포넌트에서 `useTranslation()` 훅 import
4. ✅ 모든 UI 텍스트를 `t('키.경로')` 함수로 참조
5. ✅ 변수가 포함된 텍스트는 `{{variable}}` 패턴 사용
6. ✅ 🇰🇷/🇺🇸 전환 후 텍스트가 정상 렌더링되는지 확인
