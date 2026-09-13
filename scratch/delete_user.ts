import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function deleteUser() {
  const uid = '7ad13714-3204-46bc-b0da-5bca2ad58dbf'
  
  // Delete from public.users
  const { error: dbError } = await supabase.from('users').delete().eq('id', uid)
  if (dbError) {
    console.error('Failed to delete from database:', dbError)
  } else {
    console.log('Successfully deleted from public.users')
  }

  // Delete from auth.users
  const { data, error: authError } = await supabase.auth.admin.deleteUser(uid)
  if (authError) {
    console.error('Failed to delete from auth:', authError)
  } else {
    console.log('Successfully deleted from auth.users:', data)
  }
}

deleteUser()
