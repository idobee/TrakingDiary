const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteUser() {
  const userId = '26f512cd-8698-41f0-bbef-68a55142c445'; // 수지 ID from earlier
  const { data, error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Error deleting user:", error);
  } else {
    console.log("Successfully deleted user:", data);
  }
}

deleteUser();
