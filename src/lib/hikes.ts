/**
 * Hikes Helper Utilities
 * 정모(Regular Meetup)와 벙개(Lightning/Flash Meetup) 구분 및 스타일링 헬퍼
 */

export type HikeType = 'regular' | 'lightning'

export interface HikeLike {
  id?: number
  hike_type?: string | null
  title?: string | null
  description?: string | null
}

/**
 * 산행이 벙개(번개모임)인지 여부를 판별합니다.
 * 1. hike_type이 'lightning' 또는 'flash'인 경우
 * 2. hike_type이 'regular'가 아니면서 title 또는 description에 '벙개', '번개', '[벙개]', '[번개]' 키워드가 있는 경우
 */
export const isLightningHike = (hike?: HikeLike | null): boolean => {
  if (!hike) return false
  if (hike.hike_type === 'lightning' || hike.hike_type === 'flash') return true
  if (hike.hike_type === 'regular') return false

  const title = (hike.title || '').toLowerCase()
  const desc = (hike.description || '').toLowerCase()

  if (
    title.includes('벙개') ||
    title.includes('번개') ||
    title.includes('lightning') ||
    title.includes('flash') ||
    desc.includes('#벙개') ||
    desc.includes('#번개')
  ) {
    return true
  }

  return false
}

/**
 * 산행의 타입을 'regular' 또는 'lightning'으로 정규화하여 반환합니다.
 */
export const getHikeType = (hike?: HikeLike | null): HikeType => {
  return isLightningHike(hike) ? 'lightning' : 'regular'
}

/**
 * 👑 정모(정기산행) 전용 중후하고 기품 있는 딥 & 프리미엄 양장본 그라데이션
 */
export const REGULAR_BOOK_GRADIENTS = [
  'from-[#083523] via-[#022216] to-[#01140d]', // Deep Royal Emerald
  'from-[#6b1414] via-[#480c0c] to-[#2b0505]', // Deep Imperial Terracotta / Burgundy
  'from-[#0f244a] via-[#08152e] to-[#030914]', // Royal Sapphire Navy
  'from-[#4a2e12] via-[#2e1c09] to-[#170c03]', // Antique Mahogany Bronze
  'from-[#341b4d] via-[#1f0f30] to-[#0f0717]', // Royal Velvet Purple
]

/**
 * ⚡ 벙개(번개산행) 전용 가볍고 산뜻한 라이트 & 비비드 컬러 그라데이션
 */
export const LIGHTNING_BOOK_GRADIENTS = [
  'from-[#059669] via-[#10b981] to-[#34d399]', // Fresh Mint & Light Emerald
  'from-[#0284c7] via-[#38bdf8] to-[#7dd3fc]', // Sky Breeze Blue
  'from-[#e11d48] via-[#fb7185] to-[#fda4af]', // Sunset Coral Pink
  'from-[#d97706] via-[#f59e0b] to-[#fcd34d]', // Radiant Warm Amber / Tangerine
  'from-[#7c3aed] via-[#a855f7] to-[#c084fc]', // Light Lavender Lilac
  'from-[#0d9488] via-[#14b8a6] to-[#5eead4]', // Ocean Aqua Teal
]

/**
 * 산행 종류와 인덱스에 맞는 책 표지 그라데이션을 반환합니다.
 */
export const getHikeBookGradient = (hike: HikeLike, index: number): string => {
  if (isLightningHike(hike)) {
    return LIGHTNING_BOOK_GRADIENTS[index % LIGHTNING_BOOK_GRADIENTS.length]
  }
  return REGULAR_BOOK_GRADIENTS[index % REGULAR_BOOK_GRADIENTS.length]
}
