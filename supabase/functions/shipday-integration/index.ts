
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
    
    // Shipday verification request - must respond with 200 to any GET request
    if (req.method === "GET") {
      console.log("Handling GET verification from Shipday");
      
      // According to Shipday docs, we need to respond with 200 OK to verify the webhook
      // No specific response format is required, just a 200 status code
      return new Response(
        JSON.stringify({ success: true, message: "Webhook endpoint is valid" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For POST requests (actual webhook events)
    if (req.method === "POST") {
      try {
        // Get the token from environment variable
        const storedToken = Deno.env.get("SHIPDAY_WEBHOOK_TOKEN");
        
        // Log request details for debugging
        console.log("POST webhook event received");
        console.log("Environment token is set:", storedToken ? "Yes" : "No");
        
        // Clone the request before reading the body to avoid stream already consumed errors
        const clonedReq = req.clone();
        
        try {
          // Process the payload
          const payload = await clonedReq.json();
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
        } catch (parseError) {
          console.error("Error parsing webhook payload JSON:", parseError);
          console.log("Attempting to read request body as text...");
          
          // If JSON parsing fails, try to read as text for debugging
          const clonedReq2 = req.clone();
          const textBody = await clonedReq2.text();
          console.log("Raw request body:", textBody);
          
          // Still return a 200 response to acknowledge receipt
          return new Response(
            JSON.stringify({ success: true, message: "Webhook received, but couldn't parse payload" }),
            { 
              status: 200, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        // Always return a 200 response to acknowledge receipt of the webhook
        // Shipday expects a 200 response regardless of how we process the event
        return new Response(
          JSON.stringify({ success: true, message: "Webhook received" }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        console.error("Error processing webhook:", error);
        
        // Still return a 200 response to prevent Shipday from retrying
        return new Response(
          JSON.stringify({ success: true, message: "Webhook received with errors" }),
          { 
            status: 200, 
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
    
    // Still return a 200 to prevent retries
    return new Response(
      JSON.stringify({ success: true, message: "Error but acknowledged" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
})
