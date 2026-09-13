import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function check() {
  const { data, error } = await supabase.from('club_members').select('*, users(nickname, email)').eq('club_id', 4)
  if (error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}
check()
