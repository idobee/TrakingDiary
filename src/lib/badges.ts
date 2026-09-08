export interface BadgeTemplate {
  category: string
  name: string
  icon_name: string
  visual_concept: string
  description: string
}

/**
 * 🏔️ 우리들의 산행일기: 3글자 뱃지 카탈로그 (총 10종)
 * .agents/badges.md 를 기반으로 작성된 뱃지 라이브러리입니다.
 * 동호회 생성 시 기본 뱃지로 DB(badges 테이블)에 일괄 등록(Seed)할 때 사용할 수 있습니다.
 */
export const BADGE_LIBRARY: BadgeTemplate[] = [
  {
    category: '완등',
    name: '정상콕',
    icon_name: '🚩',
    visual_concept: '눈 덮인 바위 정상석 위에 노란색 깃발을 콕 꽂는 귀여운 그래픽',
    description: '목표한 정상에 발을 디딘 모든 참가자'
  },
  {
    category: '축하',
    name: '첫완등',
    icon_name: '🎊',
    visual_concept: '버킷햇 등산모자 위로 콘페티(폭죽 가루)가 팡 터지는 모습',
    description: '첫 등산 입문, 개인 최고 고도 경신, 생일 산행자'
  },
  {
    category: '헬퍼',
    name: '인간맵',
    icon_name: '📍',
    visual_concept: '접힌 지도 그래픽 위에 네온 핑크 위치 핀이 깜빡이는 형상',
    description: '길 안내, 난코스 손잡아주기, 후발대 챙기기 담당'
  },
  {
    category: '코치',
    name: '산대장',
    icon_name: '🦯',
    visual_concept: 'X자로 교차된 두 개의 등산 스틱과 반짝이는 황금빛 휘슬',
    description: '페이스 조절, 호흡법 지도, 안전 가이드를 맡아준 친구'
  },
  {
    category: '빠름',
    name: '날다람',
    icon_name: '🐿️',
    visual_concept: '발바닥에 부스터 불꽃을 달고 점프하는 날다람쥐 캐릭터',
    description: '축지법 쓰듯 정상에 가장 먼저 도착한 선두 주자'
  },
  {
    category: '꾸준',
    name: '출석왕',
    icon_name: '💮',
    visual_concept: '작은 수첩 위로 \'참 잘했어요\' 도장이 쾅 찍힌 모습',
    description: '눈이 오나 비가 오나 산행 일정에 빠짐없이 개근한 친구'
  },
  {
    category: '감사',
    name: '천사님',
    icon_name: '🪽',
    visual_concept: '동글동글한 배낭 위로 하얀 날개와 반짝이는 링이 떠 있는 모습',
    description: '카풀 제공, 장비 대여, 간식 나눔 등 큰 도움을 준 친구'
  },
  {
    category: '만능소지',
    name: '만물상',
    icon_name: '🎒',
    visual_concept: '활짝 열린 등산 배낭에서 보조배터리, 밴드, 물티슈가 쏟아지는 이미지',
    description: '"너 혹시 이거 있어?" 하면 다 나오는 준비성 끝판왕'
  },
  {
    category: '문제해결',
    name: '해결사',
    icon_name: '🔧',
    visual_concept: '엉킨 신발끈이나 부러진 장비를 뚝딱 고쳐내는 번개 모양 공구 툴',
    description: '물집 케어, 장비 트러블, 돌발 상황을 해결해 준 친구'
  },
  {
    category: '준비만전',
    name: '준비왕',
    icon_name: '🍱',
    visual_concept: '김이 모락모락 나는 보온병과 정갈하게 담긴 산상 도시락',
    description: '맛있는 먹거리, 얼린 생수, 행동식을 철저히 준비해 온 친구'
  }
]
