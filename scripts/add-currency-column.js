const { createClient } = require('@supabase/supabase-js');

async function addCurrencyColumn() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .rpc('add_currency_column');

    if (error) {
      throw error;
    }

    console.log('Successfully added currency column to profiles table');
  } catch (error) {
    console.error('Error adding currency column:', error.message);
    process.exit(1);
  }
}

addCurrencyColumn();