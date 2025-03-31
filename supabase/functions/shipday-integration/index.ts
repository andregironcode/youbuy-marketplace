
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

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
    
    // IMPORTANT: For Shipday webhook verification, we need to accept GET requests
    // Shipday sends a GET request with a token parameter to verify the webhook
    if (req.method === "GET") {
      console.log("Handling GET verification from Shipday");
      
      // Get the token from the query params
      const token = url.searchParams.get('token');
      console.log("Received token for verification:", token || "No token provided");
      
      // No validation for GET requests - just confirm the webhook is valid
      return new Response(
        JSON.stringify({ success: true, message: "Webhook endpoint is valid" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For POST requests, we should verify the token
    if (req.method === "POST") {
      try {
        // Get the token from environment variable
        const storedToken = Deno.env.get("SHIPDAY_WEBHOOK_TOKEN");
        const token = url.searchParams.get('token');
        
        // Only validate the token if it's set in the environment
        if (storedToken && token !== storedToken) {
          console.error("Invalid webhook token");
          return new Response(
            JSON.stringify({ error: "Invalid webhook token" }),
            { 
              status: 401, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }

        // Process the payload
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
