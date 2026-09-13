import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function check() {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5)
  if (error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}
check()
