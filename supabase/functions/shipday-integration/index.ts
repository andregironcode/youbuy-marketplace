
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
  console.log("Received request:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    console.log("Request URL:", url.toString());
    console.log("Request search params:", Object.fromEntries(url.searchParams.entries()));
    
    // Handle Shipday webhook verification test - it sends a GET request to test the URL
    if (req.method === "GET") {
      console.log("Handling GET verification from Shipday");
      
      // For Shipday verification, we don't check the token on GET requests
      // This is necessary for Shipday to verify the endpoint
      return new Response(
        JSON.stringify({ success: true, message: "Webhook endpoint is valid" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For all other requests, verify the token
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

    // Handle webhook events from Shipday
    if (req.method === "POST") {
      try {
        const payload = await req.json();
        
        console.log("Received Shipday webhook payload:", JSON.stringify(payload, null, 2));
        
        // Extract the event type and handle accordingly
        const eventType = payload.eventType || payload.type || "unknown";
        console.log("Event type:", eventType);
        
        // Process different event types
        switch (eventType) {
          case "ORDER_CREATED":
            console.log("Processing order created event");
            // Handle order creation
            break;
          case "STATUS_CHANGED":
            console.log("Processing status change event");
            // Handle order status change
            break;
          case "LOCATION_UPDATED":
            console.log("Processing location update event");
            // Handle driver location update
            break;
          default:
            console.log("Received unhandled event type:", eventType);
        }
        
        return new Response(
          JSON.stringify({ success: true, message: "Webhook received" }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        console.error("Error parsing webhook payload:", error);
        return new Response(
          JSON.stringify({ error: "Invalid payload format", details: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
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
