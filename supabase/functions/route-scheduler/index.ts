
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // Admin client with service_role privileges
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the current hour to determine which route to generate
    const now = new Date();
    const currentHour = now.getHours();
    
    // Schedule morning route at 1:00 PM and afternoon route at 7:00 PM
    let shouldRunOptimization = false;
    let timeSlot: 'morning' | 'afternoon' = 'morning';
    
    if (currentHour === 13) {
      // It's 1 PM, run morning optimization (for orders from 7 PM previous day to 1 PM today)
      shouldRunOptimization = true;
      timeSlot = 'morning';
      console.log('Scheduling morning route optimization');
    } else if (currentHour === 19) {
      // It's 7 PM, run afternoon optimization (for orders from 1 PM to 7 PM today)
      shouldRunOptimization = true;
      timeSlot = 'afternoon';
      console.log('Scheduling afternoon route optimization');
    } else {
      console.log(`Current hour is ${currentHour}, no route optimization needed`);
    }
    
    if (shouldRunOptimization) {
      console.log(`Triggering route optimization for ${timeSlot} slot`);
      
      // Call the route optimization function
      const optimizationResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/route-optimization`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            requestedTimeSlot: timeSlot,
            requestedDate: now.toISOString().split('T')[0]
          })
        }
      );
      
      const optimizationResult = await optimizationResponse.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Scheduled ${timeSlot} route optimization`,
          result: optimizationResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No route optimization needed at this time'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in route scheduler:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
