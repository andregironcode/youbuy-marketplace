
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Log the basic request information
  console.log(`Shipday webhook request: ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      console.log("Handling OPTIONS request for CORS");
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // According to Shipday documentation:
    // For webhook verification, Shipday sends a GET request and expects a 200 response
    if (req.method === "GET") {
      console.log("Received GET request - This is likely Shipday verifying the webhook endpoint");
      
      // Simple 200 OK response for webhook verification
      // Shipday doesn't expect any specific response format for verification, just a 200 status
      return new Response(
        JSON.stringify({ success: true, message: "Webhook endpoint is active" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // For actual webhook events, Shipday sends POST requests
    if (req.method === "POST") {
      console.log("Received POST webhook event from Shipday");
      
      // Get the raw request body as text for logging
      const bodyText = await req.clone().text();
      console.log("Raw webhook payload:", bodyText);
      
      // Attempt to parse the JSON payload
      let payload;
      try {
        payload = JSON.parse(bodyText);
        console.log("Parsed webhook payload:", JSON.stringify(payload, null, 2));
      } catch (error) {
        console.error("Error parsing webhook JSON:", error);
        payload = {}; // Use empty object if parsing fails
      }
      
      // Get the event type from the payload
      const eventType = payload.eventType || payload.type || "unknown";
      console.log(`Processing Shipday webhook event: ${eventType}`);
      
      // Handle different event types
      // Documentation: https://docs.shipday.com/reference/webhook-notifications
      switch (eventType) {
        case "ORDER_CREATED":
          console.log("Order created event received");
          // Here you would handle a new order being created in Shipday
          break;
          
        case "ORDER_ASSIGNED":
          console.log("Order assigned event received");
          const driverId = payload.driverId;
          const orderId = payload.orderId || payload.orderNumber;
          console.log(`Order ${orderId} assigned to driver ${driverId}`);
          // Update order assignment in your database
          break;
          
        case "STATUS_CHANGED":
          console.log("Status change event received");
          const newStatus = payload.newStatus;
          const statusOrderId = payload.orderId || payload.orderNumber;
          console.log(`Order ${statusOrderId} status changed to ${newStatus}`);
          // Update order status in your database
          break;
          
        case "LOCATION_UPDATED":
          console.log("Driver location update received");
          // Process driver location update
          break;
          
        default:
          console.log(`Received unhandled event type: ${eventType}`);
      }
      
      // Always return a 200 response to acknowledge receipt of the webhook
      // Shipday expects a 200 status code response to confirm successful delivery
      return new Response(
        JSON.stringify({ success: true, message: `Successfully processed ${eventType} event` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Return 405 Method Not Allowed for any other request methods
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    // Log and return any unhandled errors
    console.error("Unhandled error in webhook handler:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
})
