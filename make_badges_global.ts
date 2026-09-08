import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function makeBadgesGlobal() {
  console.log("Updating all badges to have club_id = NULL...")
  const { data, error } = await supabase
    .from('badges')
    .update({ club_id: null })
    .not('club_id', 'is', null)

  if (error) {
    console.error("Error updating badges:", error)
  } else {
    console.log("Successfully updated badges to global.")
  }
}

makeBadgesGlobal()
