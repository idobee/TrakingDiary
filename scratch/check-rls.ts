import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkRLS() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'badges';" })
  
  if (error) {
    console.log("Cannot use RPC. Let's try querying directly via postgrest if we have a view, but probably not.")
    console.error(error)
  } else {
    console.log("Policies:", data)
  }
}

checkRLS()
