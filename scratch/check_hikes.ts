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

async function checkHikes() {
  console.log('Querying hikes directly...');
  const { data: hikes, error } = await supabase
    .from('hikes')
    .select(`*`)
    .in('id', [9, 10, 11]);
    
  if (error) {
    console.error('Error fetching hikes:', error);
  } else {
    console.log('Fetched hikes:', JSON.stringify(hikes, null, 2));
  }
}

checkHikes();
