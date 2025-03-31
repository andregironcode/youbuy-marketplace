
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Shipday API base URL
const SHIPDAY_API_BASE_URL = "https://api.shipday.com";

serve(async (req) => {
  console.log("Shipday request received:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // For basic connection testing
    if (req.method === "GET") {
      console.log("Handling GET request for connection testing");
      
      // Get the Shipday API key to validate it's set
      const apiKey = Deno.env.get("SHIPDAY_API_KEY");
      if (!apiKey) {
        console.error("SHIPDAY_API_KEY environment variable is not set");
        return new Response(
          JSON.stringify({ 
            error: "Shipday API key not configured",
            status: "failed",
            message: "Please set the SHIPDAY_API_KEY environment variable in Supabase",
            environmentVariables: Object.keys(Deno.env.toObject()).join(", ")
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Log the first few characters of the API key for debugging (avoiding exposing the full key)
      console.log(`API key found, starts with: ${apiKey.substring(0, 4)}...`);
      
      // Validate API key by making a simple request to Shipday
      try {
        console.log("Testing Shipday API key validity...");
        const testResponse = await fetch(`${SHIPDAY_API_BASE_URL}/carriers`, {
          method: "GET",
          headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
          }
        });
        
        console.log(`Shipday API test response status: ${testResponse.status}`);
        console.log(`Shipday API test response headers:`, Object.fromEntries(testResponse.headers.entries()));
        
        // Try to get response text for better error reporting
        const responseText = await testResponse.text();
        console.log(`Shipday API test response body: ${responseText}`);
        
        if (!testResponse.ok) {
          console.error("Invalid Shipday API key response:", responseText);
          return new Response(
            JSON.stringify({ 
              error: "Shipday API authentication failed", 
              status: "failed",
              details: responseText,
              statusCode: testResponse.status,
              message: "Authentication with Shipday failed. Please verify your API key format and validity.",
              note: "Make sure the API key is added exactly as provided by Shipday without any extra characters or spaces."
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        // Try to parse response as JSON if possible
        let carrierData;
        try {
          carrierData = responseText ? JSON.parse(responseText) : [];
        } catch (e) {
          console.log("Response is not JSON format:", e.message);
          carrierData = { text: responseText };
        }
        
        console.log("Shipday connection test successful with valid carriers list");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Shipday integration is active and API key is valid",
            status: "ok",
            carriers: Array.isArray(carrierData) ? carrierData.length : 'unknown'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        console.error("Error testing Shipday API key:", error);
        return new Response(
          JSON.stringify({ 
            error: "Failed to test Shipday API key", 
            message: error.message,
            status: "failed",
            stack: error.stack
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // For POST requests, treat as order creation
    if (req.method === "POST") {
      console.log("Handling POST request for order creation");
      return handleCreateOrder(req);
    }
    
    // For default path or any other methods, return error
    return new Response(
      JSON.stringify({ error: "Method not supported", message: "Only GET and POST methods are supported" }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message, stack: error.stack }),
      { 
        status: 400,
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
  // Get the Shipday API key from environment variables
  const apiKey = Deno.env.get("SHIPDAY_API_KEY");
  if (!apiKey) {
    console.error("SHIPDAY_API_KEY environment variable is not set");
    return new Response(
      JSON.stringify({ 
        error: "Shipday API key not configured",
        status: "failed",
        message: "Please set the SHIPDAY_API_KEY environment variable in Supabase"
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    // Parse the request body
    const orderData = await req.json();
    console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

    // Format the order according to Shipday API requirements
    const shipdayPayload = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerAddress: orderData.customerAddress,
      customerEmail: orderData.customerEmail,
      customerPhoneNumber: orderData.customerPhoneNumber,
      
      restaurantName: "YouBuy Marketplace", // Using this as the pickup point name
      pickupAddress: orderData.pickupAddress || "YouBuy Warehouse", // Default pickup address if none provided
      deliveryAddress: orderData.deliveryAddress,
      
      expectedPickupTime: orderData.expectedPickupTime,
      expectedDeliveryTime: orderData.expectedDeliveryTime,
      orderSource: orderData.orderSource || "YouBuy Marketplace",
      paymentMethod: orderData.paymentMethod,
      totalPrice: orderData.totalPrice,
      tip: orderData.tipAmount,
      
      // Location data
      pickupLatitude: orderData.pickupLatitude,
      pickupLongitude: orderData.pickupLongitude,
      deliveryLatitude: orderData.deliveryLatitude,
      deliveryLongitude: orderData.deliveryLongitude,
      
      // Order items
      items: orderData.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    console.log("Formatted Shipday payload:", JSON.stringify(shipdayPayload, null, 2));

    // Make a request to Shipday API to create the order
    const response = await fetch(`${SHIPDAY_API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(shipdayPayload)
    });

    // Log response status and headers for debugging
    console.log(`Shipday API response status: ${response.status}`);
    console.log(`Shipday API response headers:`, Object.fromEntries(response.headers.entries()));
    
    // Parse the response
    const responseText = await response.text();
    console.log(`Shipday API response body: ${responseText}`);
    
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error("Error parsing Shipday API response:", error);
      responseData = { text: responseText };
    }

    // Check if the order was created successfully
    if (response.ok) {
      console.log("Order created successfully in Shipday");
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: responseData,
          message: "Order created successfully in Shipday" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      // If there was an error from Shipday API
      console.error("Error creating order in Shipday:", responseData);
      
      // Provide more specific error messages based on status code
      let errorMessage = "Failed to create order in Shipday";
      if (response.status === 401 || response.status === 403) {
        errorMessage = "Authentication failed. Please check your Shipday API key.";
      } else if (response.status === 400) {
        errorMessage = "Invalid order data. Please check the order details.";
      } else if (response.status === 404) {
        errorMessage = "Shipday API endpoint not found.";
      } else if (response.status === 429) {
        errorMessage = "Too many requests to Shipday. Please try again later.";
      } else if (response.status >= 500) {
        errorMessage = "Shipday server error. Please try again later.";
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: responseData,
          status: response.status,
          message: responseText || "No response details available"
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order", message: error.message, stack: error.stack }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
