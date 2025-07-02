const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    schema: 'pos' // Optional: ensures the default schema is set
  }
);

module.exports = supabase;
