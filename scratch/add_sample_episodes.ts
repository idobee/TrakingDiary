import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const clubId = parseInt(process.env.NEXT_PUBLIC_SAMPLE_CLUB_ID || '6')

// Copy images
const artifactsDir = 'C:\\Users\\leejo\\.gemini\\antigravity-ide\\brain\\2a3f1942-4644-4e57-9935-521d7505a5b2'
const publicDir = 'C:\\ITSTUDY\\TrakingDiary\\public\\samples'
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

const images = [
  { name: 'sample_ep1.jpg', pattern: 'sample_ep1_1789541386508.jpg' },
  { name: 'sample_ep2.jpg', pattern: 'sample_ep2_1789550483389.jpg' },
  { name: 'sample_ep3.jpg', pattern: 'sample_ep3_1789550619034.jpg' },
  { name: 'sample_ep4.jpg', pattern: 'sample_ep4_1789550723289.jpg' }
]

images.forEach(img => {
  const src = path.join(artifactsDir, img.pattern)
  const dest = path.join(publicDir, img.name)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`Copied ${img.name}`)
  } else {
    console.log(`Missing ${src}`)
  }
})

async function addEpisodes() {
  const { data: clubData } = await supabase.from('clubs').select('owner_id').eq('id', clubId).single()
  if (!clubData) throw new Error('Club not found')
  const ownerId = clubData.owner_id

  // Episode 2: Plogging
  const date2 = new Date(); date2.setDate(date2.getDate() - 7);
  const { data: hike2 } = await supabase.from('hikes').insert({
    club_id: clubId, organizer_id: ownerId, title: '한강 반포공원 플로깅 (줍깅)',
    mountain_name: '한강 고수부지', hike_date: date2.toISOString(), difficulty: 'easy',
    status: 'completed', description: '환경도 살리고 건강도 챙기는 한강 플로깅 모임!', cover_image_url: '/samples/sample_ep2.jpg'
  }).select().single();
  
  await supabase.from('episodes').insert({
    hike_id: hike2.id, author_id: ownerId, title: '뿌듯함이 두 배! 한강 쓰레기 줍깅 ♻️',
    content: '주말 아침 상쾌한 공기를 마시며 한강 반포공원 일대에서 쓰레기를 주웠습니다. 지나가시는 분들이 응원도 해주셔서 정말 뿌듯했어요! 깨끗해진 길을 보니 기분까지 맑아지는 하루였습니다.',
    photo_urls: ['/samples/sample_ep2.jpg'], is_published: true
  });

  // Episode 3: Pajeon
  const date3 = new Date(); date3.setDate(date3.getDate() - 14);
  const { data: hike3 } = await supabase.from('hikes').insert({
    club_id: clubId, organizer_id: ownerId, title: '서촌 골목길 투어 & 맛집 탐방',
    mountain_name: '서촌 골목', hike_date: date3.toISOString(), difficulty: 'easy',
    status: 'completed', description: '옛 정취가 가득한 서촌을 걷고 맛있는 해물파전을 먹어요.', cover_image_url: '/samples/sample_ep3.jpg'
  }).select().single();

  await supabase.from('episodes').insert({
    hike_id: hike3.id, author_id: ownerId, title: '서촌 골목 2만보 걷고 먹은 해물파전 꿀맛 🍯',
    content: '구불구불한 서촌 한옥마을 골목을 구경하느라 시간 가는 줄 몰랐어요. 2만 보 넘게 걷고 난 뒤 허름한 노포에서 먹은 바삭한 해물파전과 막걸리는 정말 예술이었습니다. 다음 맛집 탐방도 기대되네요!',
    photo_urls: ['/samples/sample_ep3.jpg'], is_published: true
  });

  // Episode 4: Namsan
  const date4 = new Date(); date4.setDate(date4.getDate() - 21);
  const { data: hike4 } = await supabase.from('hikes').insert({
    club_id: clubId, organizer_id: ownerId, title: '남산 서울타워 야경 트레킹',
    mountain_name: '남산 둘레길', hike_date: date4.toISOString(), difficulty: 'medium',
    status: 'completed', description: '퇴근 후 남산 둘레길을 따라 서울타워 야경을 보러 갑니다.', cover_image_url: '/samples/sample_ep4.jpg'
  }).select().single();

  await supabase.from('episodes').insert({
    hike_id: hike4.id, author_id: ownerId, title: '퇴근 후 힐링, 남산 둘레길 야간 걷기 🌃',
    content: '요즘 날씨가 너무 좋아서 급 벙개로 남산을 다녀왔습니다. 케이블카를 타지 않고 둘레길로 걸어 올라가는 길 내내 서울 야경이 너무 멋졌습니다. 스트레스가 싹 풀리는 힐링 타임!',
    photo_urls: ['/samples/sample_ep4.jpg'], is_published: true
  });

  console.log("Added 3 episodes successfully!")
}
addEpisodes()
