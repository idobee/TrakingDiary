import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function seed() {
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.error("No users found to set as owner.");
    return;
  }
  const ownerId = users[0].id;

  const { data: club, error: clubErr } = await supabase.from('clubs').insert({
    owner_id: ownerId,
    name: '서울 둘레길 뚜벅이',
    category: 'tracking',
    description: '도심 속 힐링 산책. 주말마다 가볍게 걸으며 맛집도 탐방하는 모임입니다.',
    logo_url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2070&auto=format&fit=crop',
    status: 'approved'
  }).select().single();
  if (clubErr) console.error("Club Error:", clubErr);
  else console.log("Club:", club.id);

  const hikeDate = new Date();
  hikeDate.setDate(hikeDate.getDate() - 2);

  const { data: hike, error: hikeErr } = await supabase.from('hikes').insert({
    club_id: club.id,
    organizer_id: ownerId,
    title: '서울 둘레길 1코스 완주',
    mountain_name: '서울 둘레길 (수락산 구간)',
    hike_date: hikeDate.toISOString(),
    difficulty: 'easy',
    status: 'completed',
    description: '초보자도 걷기 좋은 수락산 입구 둘레길 산책!',
    cover_image_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041&auto=format&fit=crop'
  }).select().single();
  if (hikeErr) console.error("Hike Error:", hikeErr);
  else console.log("Hike:", hike.id);

  const { data: episode, error: epErr } = await supabase.from('episodes').insert({
    hike_id: hike.id,
    author_id: ownerId,
    title: '날씨 완벽했던 주말의 둘레길 산책 🌿',
    content: '주말 아침 일찍 모여 수락산 둘레길을 걸었습니다. 바람도 선선하고 미세먼지도 없어서 걷기에 완벽한 날씨였어요! 2시간 정도 걷고 근처 맛집에서 먹은 도토리묵과 파전은 꿀맛이었습니다. 다음 번 도심 걷기 행사에도 많이 참여해 주세요!',
    photo_urls: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=2041&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=2070&auto=format&fit=crop'
    ],
    is_published: true
  }).select().single();
  if (epErr) console.error("Episode Error:", epErr);
  else console.log("Episode:", episode.id);
}
seed();
