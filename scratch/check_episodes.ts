import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function check() {
  const {data} = await supabase.from('episodes').select('id, title, photo_urls').eq('author_id', 'd83c27e0-25fa-4c60-a237-775c74239f1c');
  console.log(JSON.stringify(data, null, 2));
}
check()