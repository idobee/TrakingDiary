import json
import os

ko_path = r"c:\ITSTUDY\TrakingDiary\src\locales\ko.json"
en_path = r"c:\ITSTUDY\TrakingDiary\src\locales\en.json"

def update_ko():
    with open(ko_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Header
    data["header"]["appTitle"] = "함께쓰는 클럽 다이어리"
    data["header"]["appSubtitle"] = "Shared Activity & Club Archive (Next.js 14+ App Router)"
    data["header"]["tabs"]["hikes"] = "🗓️ 활동모집 & 일정표"
    data["header"]["tabs"]["diaries"] = "📚 클럽앨범 & 일기"
    data["header"]["tabs"]["my"] = "🏅 마이클럽 & 뱃지"
    data["header"]["profileUc"] = "UC4 마이클럽"
    
    # Dashboard
    data["dashboard"]["heroTitleLine1"] = "함께 한 찬란한 순간들,"
    data["dashboard"]["heroDescription"] = "동호회 활동 모집(UC2), 구글 공유 드라이브 원본 사진 저장(UC9), 월별 하드커버 단행본 서가(UC3), 그리고 참여 뱃지(UC5)까지 활동 추억을 아카이빙하세요."
    data["dashboard"]["heroCtaHikes"] = "📖 함께쓰는 다이어리 둘러보기"
    data["dashboard"]["heroCtaDiaries"] = "📸 클럽 앨범 바로가기"
    data["dashboard"]["recentHikesTitle"] = "🚩 모집중인 최근 활동 (UC2)"
    data["dashboard"]["metricsUpcomingLabel"] = "Upcoming Activities"
    
    # Diaries
    data["diaries"]["sectionTitle"] = "📖 클럽앨범 & 교환일기 단행본 서가"
    data["diaries"]["sectionDesc"] = "우리 동호회가 함께 쓴 활동 교환일기와 에피소드가 월별 디지털 하드커버 단행본으로 서가에 보관됩니다."
    data["diaries"]["tipText"] = "💡 서가에 놓인 책 표지를 클릭하면 단위 활동일기(UC8)로 이동합니다."
    
    # My
    data["my"]["sectionTitle"] = "🎖️ 마이클럽 & 나의 뱃지 갤러리"
    data["my"]["sectionDesc"] = "개인 동호회 활동 이력과 관리자가 부여한 스탬프 뱃지 현황입니다."
    data["my"]["stampCountLabel"] = "참여 스탬프 18개"
    data["my"]["activityMeta"] = "총 18회 활동 완료 • 획득 뱃지 동기화"
    data["my"]["summitCompleted"] = "참여완료"
    data["my"]["episodesTitle"] = "✍️ 내가 작성한 활동 에피소드 목록"
    
    # Clubs
    data["clubs"]["sectionDesc"] = "새로운 활동 동호회를 개설 신청(UC17)하거나, 동호회의 구글 드라이브/Gemini 키 설정, 회원 승인, 활동 일정 및 뱃지 생성을 통합 관리(UC15)합니다."
    
    # Modal
    data["modal"]["admin"]["description"] = "구글 공유 드라이브 Key 및 Gemini API Key 연동, 회원 가입 승인, 활동 일정 및 뱃지 생성을 관리합니다."
    data["modal"]["admin"]["tabHikes"] = "🗓️ 활동 일정 등록"
    data["modal"]["admin"]["tabBadges"] = "🏆 참여 뱃지 생성"
    data["modal"]["admin"]["hikesPlaceholder"] = "클럽 활동 일정 추가 등록"
    data["modal"]["admin"]["keysFolderHint"] = "활동 이미지 업로드 시 해당 공유 드라이브 폴더 하위에 자동 분류됩니다."
    
    with open(ko_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_en():
    with open(en_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Header
    data["header"]["appTitle"] = "Shared Club Diary"
    data["header"]["appSubtitle"] = "Shared Activity & Club Archive (Next.js 14+ App Router)"
    data["header"]["tabs"]["hikes"] = "🗓️ Activity Schedule"
    data["header"]["tabs"]["diaries"] = "📚 Club Album & Diary"
    data["header"]["tabs"]["my"] = "🏅 My Club & Badges"
    data["header"]["profileUc"] = "UC4 My Club"
    
    # Dashboard
    data["dashboard"]["heroTitleLine1"] = "Moments shared together,"
    data["dashboard"]["heroDescription"] = "Archive your club memories — from activity recruitment (UC2), original photo storage on Google Shared Drive (UC9), monthly hardcover bookshelf (UC3), to participation badges (UC5)."
    data["dashboard"]["heroCtaDiaries"] = "📸 Go to Club Album"
    data["dashboard"]["recentHikesTitle"] = "🚩 Recent Recruiting Activities (UC2)"
    data["dashboard"]["metricsUpcomingLabel"] = "Upcoming Activities"
    
    # Diaries
    data["diaries"]["sectionTitle"] = "📖 Club Album & Exchange Diary Bookshelf"
    data["diaries"]["sectionDesc"] = "Our club's activity exchange diaries and episodes are preserved as monthly digital hardcover editions on the bookshelf."
    data["diaries"]["tipText"] = "💡 Click the book cover on the shelf to open the activity diary (UC8)."
    
    # My
    data["my"]["sectionTitle"] = "🎖️ My Club & Badge Gallery"
    data["my"]["sectionDesc"] = "Your personal activity history and stamp badges granted by club administrators."
    data["my"]["stampCountLabel"] = "18 participation stamps"
    data["my"]["activityMeta"] = "18 activities completed • Badge sync active"
    data["my"]["summitCompleted"] = "Completed"
    data["my"]["episodesTitle"] = "✍️ My Written Activity Episodes"
    
    # Clubs
    data["clubs"]["sectionDesc"] = "Create a new activity club (UC17), or manage Google Drive/Gemini key settings, member approvals, activity schedules, and badge creation (UC15)."
    
    # Modal
    data["modal"]["admin"]["description"] = "Manage Google Shared Drive Key, Gemini API Key integration, member approval, activity scheduling, and badge creation."
    data["modal"]["admin"]["tabHikes"] = "🗓️ Activity Schedule Registration"
    data["modal"]["admin"]["tabBadges"] = "🏆 Participation Badge Creation"
    data["modal"]["admin"]["hikesPlaceholder"] = "Register New Activity Schedule"
    data["modal"]["admin"]["keysFolderHint"] = "When uploading activity images, they will be automatically organized under this shared drive folder."
    
    with open(en_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    update_ko()
    update_en()
    print("Locales updated successfully!")
