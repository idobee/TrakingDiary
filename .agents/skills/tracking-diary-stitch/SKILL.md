---
name: tracking-diary-stitch
description: Guidelines, design tokens, component specifications, and Stitch screen blueprints for building the "함께쓰는 Tracking 일기 (산행 추억 아카이브)" web application.
---

# 🏔️ Skill: 함께쓰는 Tracking 일기 (Stitch UI & Design System)

이 스킬은 Stitch에서 설계된 **"산행 추억 아카이브 (Shared Peak & Path)"** 프로젝트의 UI 디자인 시스템, 색상/폰트 토큰, 15개 스크린 청사진 및 프론트엔드 UI 컴포넌트 개발 규칙을 제공합니다.

---

## 🎨 1. Design System & Theme Tokens

### 🎨 Color Palette
- **Primary (Forest Green)**: `#012d1d` (Grounding anchor for UI & primary buttons)
- **Primary Container**: `#1b4332` (Card headers & focused elements)
- **Background / Paper**: `#fdfae7` (Warm recycled paper texture background)
- **Secondary (Earth & Sun)**: `#7d562d` / `#ffca98` (Highlights, weather chips, progress bars)
- **Tertiary (Terracotta)**: `#500c00` / `#741b04` (Callout badges, alert buttons, warm stamps)
- **Surface**: `#fdfae7`
- **Surface Container Low**: `#f7f4e1`
- **Surface Container High**: `#ece9d6`
- **Text On-Surface**: `#1c1c11`

### 🔤 Typography (Google Fonts)
- **Headlines / Display**: `Bricolage Grotesque` (700 / 800) - 아날로그 스크랩북 타이틀 폰트
- **Body Text**: `Be Vietnam Pro` (400 / 500) - 가독성 높은 다이어리 에세이 본문
- **Labels & Monospace Specs**: `Space Grotesk` (500) - 고도, 거리, 코스 데이터 레이블

### 📐 Shapes & Elevation
- **Card Border Radius**: `16px (1rem)` 또는 `24px (1.5rem)`
- **Pill Buttons**: `9999px (full)`
- **Shadows**: Soft ambient shadow (`blur: 15px, opacity: 0.08, color: #1b4332`)
- **Scrapbook Detail**: 폴라로이드 사진 프레임 (마진 하단에 넓은 흰색 영역), 테이프/마스킹 테이프 장식 오버레이

---

## 📱 2. Stitch Screen Blueprints (15 Screens)

| 번호 | 스크린 명칭 | 레이아웃 타입 | 주요 UI 컴포넌트 |
| :--- | :--- | :--- | :--- |
| **01** | **산행 모집 & 일정표** | Mobile / Desktop | 일정 카드, 난이도 뱃지, 참가 신청 버튼, 코스 개요 |
| **02** | **대시보드 & 캐릭터 카드** | Mobile / Desktop | 개인 레벨 카드, 총 등반 고도, 수집 스탬프, 최근 활동 타임라인 |
| **03** | **에세이 작성 및 사진 선택** | Mobile | Google Shared Drive 사진 선택 그리드, 에세이 텍스트 입력창 |
| **04** | **에세이 작성하기** | Mobile | 마크다운 지원 에세이 에디터, 텍스트 스타일 툴바 |
| **05** | **산행 일기 단행본** | Mobile | 매거진형 단행본 표지, 산행별 섹션 분할 뷰 |
| **06** | **산행 일기 단행본 아카이브** | Mobile / Desktop | 월별 단행본 서가 뷰, 이북(E-Book) 스타일 가로 스크롤 카드 |
| **07** | **사진첩 & B컷 아카이브** | Mobile | 폴라로이드 Grid, B컷 필터 태그, 사진 줌 모달 |
| **08** | **뱃지 갤러리 & 활동 기록** | Mobile | 러버 스탬프 형태의 완등 뱃지 그리드, 해금 조건 팝업 |
| **09** | **멤버 리스트 & 참여도** | Mobile / Desktop | 모임 멤버 프로필, 출석 도장, 함께한 산행 타임라인 |

---

## 🛠️ 3. Frontend UI Component Rules

1. **폴라로이드 메모리 카드 (`PolaroidCard`)**
   - 흰색 굵은 테두리와 아래쪽 여백(Polaroid Style)
   - 사진 위에 수놓은 듯한 마스킹 테이프 UI 컴포넌트 추가
   - 폰트: `Be Vietnam Pro` (본문) + `Space Grotesk` (날짜/장소)

2. **완등 스탬프 뱃지 (`SummitBadge`)**
   - 원형의 러버 스탬프 질감 오버레이
   - 획득 완료 시 Terracotta/Forest Green 그라데이션, 미획득 시 흑백 투명도 30%

3. **산행 일정 모집 카드 (`HikeRecruitCard`)**
   - 난이도(상/중/하)에 따른 색상 칩 (초록/노랑/주황)
   - 참가 멤버 아바타 스택 (Avatar Group) 및 '함께 가기' 버튼

4. **관리자 전용 뱃지 수여 모달 (`BadgeGrantModal`)**
   - 동호회 관리자(`owner`/`admin`) 권한인 경우에만 멤버 목록 옆에 '뱃지 부여' 버튼 노출
   - 뱃지 목록 선택 후 산행 참가자 체크박스로 다중 지급 지원

