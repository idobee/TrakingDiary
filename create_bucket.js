const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBucket() {
  const { data, error } = await supabaseAdmin.storage.createBucket('thumbnails', {
    public: true,
    fileSizeLimit: 5242880 // 5MB limit
  });
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket already exists.');
    } else {
      console.error('Failed to create bucket:', error);
    }
  } else {
    console.log('Bucket created:', data);
  }
}

createBucket();
