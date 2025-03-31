
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Log request details
  console.log(`Shipday webhook: ${req.method} ${req.url}`);
  console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // According to Shipday docs, webhook verification uses a GET request
    // We must respond with a 200 status code for the verification to succeed
    if (req.method === "GET") {
      console.log("Handling GET verification request from Shipday");
      
      // Simply return a 200 OK response to verify the webhook
      // Don't try to validate any tokens for the verification step
      return new Response(
        JSON.stringify({ success: true, message: "Webhook endpoint verified successfully" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For POST requests (actual webhook events)
    if (req.method === "POST") {
      console.log("Received webhook POST event from Shipday");
      
      try {
        // Get the request body as text first for logging
        const textBody = await req.clone().text();
        console.log("Raw webhook payload:", textBody);
        
        // Try to parse as JSON if possible
        let payload = {};
        try {
          payload = JSON.parse(textBody);
          console.log("Parsed webhook payload:", JSON.stringify(payload, null, 2));
        } catch (parseError) {
          console.error("Error parsing webhook JSON:", parseError);
          // Continue with the raw text
        }
        
        // Extract the event type if available
        const eventType = payload.eventType || payload.type || "unknown";
        console.log("Processing webhook event type:", eventType);
        
        // Handle different event types
        switch (eventType) {
          case "ORDER_CREATED":
            console.log("Processing order created event");
            // Handle order creation logic here
            break;
            
          case "ORDER_ASSIGNED":
            console.log("Processing order assigned event");
            // Handle order assignment logic here
            break;
            
          case "STATUS_CHANGED":
            console.log("Processing status change event");
            // Handle status change logic here
            const newStatus = payload.newStatus;
            const orderId = payload.orderId || payload.orderNumber;
            console.log(`Order ${orderId} status changed to ${newStatus}`);
            break;
            
          case "LOCATION_UPDATED":
            console.log("Processing location update event");
            // Handle driver location update logic here
            break;
            
          default:
            console.log(`Received unhandled event type: ${eventType}`);
        }
        
        // Always return a 200 response to acknowledge receipt
        return new Response(
          JSON.stringify({ success: true, message: `Successfully processed ${eventType} event` }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        console.error("Error processing webhook:", error);
        
        // Return a 200 anyway to prevent Shipday from retrying
        return new Response(
          JSON.stringify({ success: true, message: "Webhook acknowledged with processing errors" }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // Method not allowed for other request types
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unhandled error in webhook handler:", error);
    
    // Return a 500 error
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
})
