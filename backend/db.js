// backend/db.js
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  db: { schema: 'pos' },
  global: { headers: { 'X-Client-Info': 'envoy-backend' } },
});

module.exports = supabase;
