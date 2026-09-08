import { createClient } from '@supabase/supabase-js'
import { BADGE_LIBRARY } from './src/lib/badges'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log("Fetching existing clubs...")
  const { data: clubs, error: clubError } = await supabase.from('clubs').select('id, name')
  
  if (clubError) {
    console.error("Error fetching clubs:", clubError)
    return
  }
  
  if (!clubs || clubs.length === 0) {
    console.log("No clubs found. Cannot insert badges without a club_id.")
    return
  }
  
  console.log(`Found ${clubs.length} clubs. Starting badge seed...`)
  
  for (const club of clubs) {
    console.log(`Inserting badges for club: ${club.name} (ID: ${club.id})`)
    
    // Check if badges already exist for this club to avoid duplicates
    const { data: existingBadges } = await supabase
      .from('badges')
      .select('name')
      .eq('club_id', club.id)
      
    const existingNames = existingBadges?.map(b => b.name) || []
    
    const badgesToInsert = BADGE_LIBRARY
      .filter(badge => !existingNames.includes(badge.name))
      .map(badge => ({
        club_id: club.id,
        name: badge.name,
        icon_name: badge.icon_name,
        description: badge.description
      }))
      
    if (badgesToInsert.length === 0) {
      console.log(`Badges already exist for club ${club.id}. Skipping.`)
      continue
    }

    const { error: insertError } = await supabase.from('badges').insert(badgesToInsert)
    if (insertError) {
      console.error(`Error inserting badges for club ${club.id}:`, insertError)
    } else {
      console.log(`Successfully inserted ${badgesToInsert.length} badges for club ${club.id}`)
    }
  }
  
  console.log("Badge seeding complete!")
}

seed()
