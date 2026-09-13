const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) console.error("Auth error:", authErr);
  
  const { data: publicUsers, error: pubErr } = await supabase.from('users').select('*');
  if (pubErr) console.error("Public error:", pubErr);

  console.log("=== AUTH USERS ===");
  if (authUsers && authUsers.users) {
    authUsers.users.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.user_metadata?.name || u.user_metadata?.full_name} | Provider: ${u.app_metadata?.provider}`);
    });
  }

  console.log("\n=== PUBLIC USERS ===");
  if (publicUsers) {
    publicUsers.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Nickname: ${u.nickname} | Provider: ${u.provider}`);
    });
  }
}
check();
