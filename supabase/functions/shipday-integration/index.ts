
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Shipday API base URL
const SHIPDAY_API_BASE_URL = "https://api.shipday.com";

serve(async (req) => {
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
    const path = url.pathname.split('/').pop();
    console.log(`Shipday request path: ${path}`);
    
    // Order creation endpoint
    if (path === "create-order") {
      return handleCreateOrder(req);
    }
    
    // For default path or empty path, return success for webhook verification
    return new Response(
      JSON.stringify({ success: true, message: "Shipday integration is active" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

/**
 * Handle order creation in Shipday
 * Based on API docs: https://docs.shipday.com/reference/create-order
 */
async function handleCreateOrder(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST to create orders." }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // Get the Shipday API key from environment variables
  const apiKey = Deno.env.get("SHIPDAY_API_KEY");
  if (!apiKey) {
    console.error("SHIPDAY_API_KEY environment variable is not set");
    return new Response(
      JSON.stringify({ error: "Shipday API key not configured" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    // Parse the request body
    const orderData = await req.json();
    console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

    // Make a request to Shipday API to create the order
    const response = await fetch(`${SHIPDAY_API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    // Log response status and headers for debugging
    console.log(`Shipday API response status: ${response.status}`);
    console.log(`Shipday API response headers:`, Object.fromEntries(response.headers.entries()));
    
    // Parse the response
    const responseText = await response.text();
    console.log(`Shipday API response body: ${responseText}`);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing Shipday API response:", error);
      responseData = { text: responseText };
    }

    // Check if the order was created successfully
    if (response.ok) {
      console.log("Order created successfully in Shipday");
      return new Response(
        JSON.stringify({ success: true, data: responseData }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      // If there was an error from Shipday API
      console.error("Error creating order in Shipday:", responseData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create order in Shipday", 
          details: responseData,
          status: response.status
        }),
        { 
          status: response.status || 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order", message: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
