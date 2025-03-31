
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Check if the webhook token in the URL matches stored secret token
const verifyWebhookToken = (url: URL): boolean => {
  const token = url.searchParams.get('token');
  
  // Get the token from environment variable (set in Supabase Dashboard)
  // For security, we would use this in production
  const storedToken = Deno.env.get("SHIPDAY_WEBHOOK_TOKEN");
  
  // If we have an env token, use it, otherwise accept any token for development
  if (storedToken) {
    return token === storedToken;
  } else {
    // In development, we'll accept any token that's provided
    // This is not secure for production!
    console.log("No SHIPDAY_WEBHOOK_TOKEN set in environment, accepting any token");
    return token !== null && token !== "";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url);
    
    // Verify the webhook token
    if (!verifyWebhookToken(url)) {
      console.error("Invalid webhook token");
      return new Response(
        JSON.stringify({ error: "Invalid webhook token" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Handle different webhook events from Shipday
    if (req.method === "POST") {
      const payload = await req.json();
      
      console.log("Received Shipday webhook:", JSON.stringify(payload));
      
      // Here we would process the data based on event type
      // For example, update order status, notify users, etc.
      
      return new Response(
        JSON.stringify({ success: true, message: "Webhook received" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For all other types of requests
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
})
