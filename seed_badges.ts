import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

export const BADGE_LIBRARY = [
  { name: '새내기', icon_name: '🌱', description: '모임에 처음 나와 무사히 적응한 귀여운 신규 멤버' },
  { name: '지박령', icon_name: '💮', description: '어느 모임이든 항상 출몰해서 자리를 지키는 멤버' },
  { name: '비타민', icon_name: '✨', description: '오디오가 비지 않게 모임의 텐션을 쫙 끌어올린 멤버' },
  { name: '찍사님', icon_name: '📸', description: '자기 노는 것보다 멤버들 인생샷(프사) 건져주기 바쁜 포토그래퍼' },
  { name: '보부상', icon_name: '🎒', description: '밴드, 충전기, 물티슈 등 필요한 건 다 나오는 만능 멤버' },
  { name: '대장님', icon_name: '🧭', description: '모임 섭외부터 길 안내까지 멱살 잡고 하드캐리한 리더' },
  { name: '천사님', icon_name: '🪽', description: '뒷정리, 카풀 등 아무도 모르게 묵묵히 도와준 감동 멤버' },
  { name: '해결사', icon_name: '🔧', description: '장비 세팅, 오류 해결 등 난관이 닥쳤을 때 뚝딱 고쳐내는 척척박사' },
  { name: '멘토님', icon_name: '🤝', description: '뉴비들에게 꿀팁과 룰을 찰떡같이 전수해주는 베테랑' },
  { name: '간식왕', icon_name: '🍱', description: '기가 막힌 맛집을 알아오거나 센스 있는 당보충을 책임지는 멤버' }
]

async function seedBadges() {
  console.log("Deleting existing global badges...")
  await supabase.from('badges').delete().is('club_id', null)
  
  console.log("Inserting new global badges...")
  const { data, error } = await supabase.from('badges').insert(
    BADGE_LIBRARY.map(b => ({
      name: b.name,
      icon_name: b.icon_name,
      description: b.description,
      club_id: null // Global badge
    }))
  )
  if (error) {
    console.error("Insert error", error)
  } else {
    console.log("Successfully inserted global badges!")
  }
}

seedBadges()
