const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sync() {
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) { console.error("Auth error:", authErr); return; }
  
  const { data: publicUsers, error: pubErr } = await supabase.from('users').select('id');
  if (pubErr) { console.error("Public error:", pubErr); return; }

  const publicIds = new Set(publicUsers.map(u => u.id));
  
  for (const user of authUsers.users) {
    if (!publicIds.has(user.id)) {
      console.log(`Syncing missing user: ${user.user_metadata?.name} (${user.id})`);
      const provider = user.app_metadata?.provider || 'oauth';
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Trekker';
      const avatarUrl = user.user_metadata?.avatar_url || '';

      const { error: upsertError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email || '',
        nickname: name,
        avatar_url: avatarUrl,
        provider: provider === 'kakao' || provider === 'google' || provider === 'naver' ? provider : 'oauth',
      }, { onConflict: 'id' });
      
      if (upsertError) {
        console.error(`Failed to sync ${name}:`, upsertError);
      } else {
        console.log(`Successfully synced ${name}`);
      }
    }
  }
  console.log("Sync complete!");
}
sync();
