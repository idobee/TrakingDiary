import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Querying supabase...');
  const { data: eps, error } = await supabase
    .from('episodes')
    .select(`id, hike_id, title, hikes(club_id, clubs(name, logo_url))`)
    .in('hike_id', [9, 10, 11])
    .eq('is_published', true);
    
  if (error) {
    console.error('Error fetching episodes:', error);
  } else {
    console.log('Fetched episodes:', JSON.stringify(eps, null, 2));
  }
}

checkData();
