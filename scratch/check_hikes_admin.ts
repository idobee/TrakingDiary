import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role key

if (!serviceRoleKey) {
  console.error("No service role key found. We can't bypass RLS.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkHikesWithServiceRole() {
  console.log('Querying hikes directly with Service Role (Bypassing RLS)...');
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

checkHikesWithServiceRole();
