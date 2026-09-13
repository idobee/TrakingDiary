import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing environment variables")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

async function deleteUser(userId: string) {
  console.log(`Deleting user: ${userId}...`)
  
  // First delete from public.users to be safe, though cascade might handle it
  const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', userId)
  if (dbError) {
    console.log("Error deleting from public.users (might not exist):", dbError.message)
  } else {
    console.log("Successfully deleted from public.users (or it didn't exist)")
  }

  // Then delete from auth.users
  const { data, error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authError) {
    console.error("Failed to delete user from auth.users:", authError.message)
  } else {
    console.log("Successfully deleted user from auth.users!", data)
  }
}

deleteUser('98f251c9-c4cb-4309-bd15-1e1adaf6f390')
