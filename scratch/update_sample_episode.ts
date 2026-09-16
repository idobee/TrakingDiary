import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// 1. Copy Image
const artifactsDir = 'C:\\Users\\leejo\\.gemini\\antigravity-ide\\brain\\2a3f1942-4644-4e57-9935-521d7505a5b2'
const publicDir = 'C:\\ITSTUDY\\TrakingDiary\\public\\samples'
const src = path.join(artifactsDir, 'sample_ep5_1789550791261.jpg')
const dest = path.join(publicDir, 'sample_ep5.jpg')

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest)
  console.log('Copied sample_ep5.jpg')
} else {
  console.log('Image not found at', src)
}

// 2. Update DB
async function updateEpisode() {
  const clubId = parseInt(process.env.NEXT_PUBLIC_SAMPLE_CLUB_ID || '6')
  
  // Find the hike with the food title
  const { data: hike } = await supabase.from('hikes')
    .select('id')
    .eq('club_id', clubId)
    .like('title', '%서촌%')
    .single();
    
  if (hike) {
    // Update Hike
    await supabase.from('hikes').update({
      title: '고요한 아침의 숲길 걷기',
      mountain_name: '비밀의 숲 산책로',
      description: '사람 없는 고요한 숲길을 걸으며 온전히 자연에 집중하는 시간.',
      cover_image_url: '/samples/sample_ep5.jpg'
    }).eq('id', hike.id);
    
    // Update Episode
    await supabase.from('episodes').update({
      title: '아무도 없는 숲길에서 만난 완벽한 고요함 🌲',
      content: '아침 일찍 사람들의 발길이 닿지 않은 깊은 숲길을 찾았습니다. 새소리와 바람 소리만 들리는 이 고요함이 너무 좋네요. 복잡한 생각들이 모두 정리되는 완벽한 힐링 트레킹이었습니다.',
      photo_urls: ['/samples/sample_ep5.jpg']
    }).eq('hike_id', hike.id);
    
    console.log('Successfully updated the food episode to a landscape episode.');
  } else {
    console.log('Could not find the target hike to update.');
  }
}
updateEpisode();
