
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15",
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "confirm-delivery") {
      return await handleConfirmDelivery(req);
    } else if (path === "submit-dispute") {
      return await handleSubmitDispute(req);
    } else if (path === "process-completed-orders") {
      return await handleProcessCompletedOrders(req);
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function handleConfirmDelivery(req) {
  const { orderId, userId } = await req.json();

  // Verify that the user is the buyer
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("buyer_id", userId)
    .maybeSingle();

  if (!order) {
    return new Response(
      JSON.stringify({ error: "Order not found or you're not authorized" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      }
    );
  }

  // Calculate dispute deadline (12 hours from now)
  const disputeDeadline = new Date();
  disputeDeadline.setHours(disputeDeadline.getHours() + 12);

  // Update order status
  await supabase
    .from("orders")
    .update({
      status: "delivered",
      payment_status: "escrow",
      delivery_confirmed_at: new Date().toISOString(),
      dispute_deadline: disputeDeadline.toISOString(),
    })
    .eq("id", orderId);

  return new Response(
    JSON.stringify({ success: true, disputeDeadline: disputeDeadline.toISOString() }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function handleSubmitDispute(req) {
  const { orderId, userId, reason } = await req.json();

  // Verify that the user is the buyer and within dispute window
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("buyer_id", userId)
    .maybeSingle();

  if (!order) {
    return new Response(
      JSON.stringify({ error: "Order not found or you're not authorized" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      }
    );
  }

  // Check if dispute deadline has passed
  const now = new Date();
  const disputeDeadline = new Date(order.dispute_deadline);
  
  if (now > disputeDeadline) {
    return new Response(
      JSON.stringify({ error: "Dispute window has closed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  // Update order with dispute information
  await supabase
    .from("orders")
    .update({
      dispute_reason: reason,
      dispute_status: "opened",
      status: "disputed",
      payment_status: "dispute_hold",
    })
    .eq("id", orderId);

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function handleProcessCompletedOrders(req) {
  // This endpoint would normally be called by a cron job
  // Find orders where the dispute window has passed and status is still "escrow"
  const now = new Date().toISOString();
  
  const { data: ordersToProcess } = await supabase
    .from("orders")
    .select(`
      *,
      seller:seller_id (
        stripe_account_id:seller_accounts!inner(stripe_account_id)
      )
    `)
    .eq("payment_status", "escrow")
    .lt("dispute_deadline", now);

  if (!ordersToProcess || ordersToProcess.length === 0) {
    return new Response(
      JSON.stringify({ message: "No orders to process" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }

  const results = [];

  for (const order of ordersToProcess) {
    try {
      // Release the payment to the seller
      // In a real implementation, we would use Stripe Transfer API here
      // But for now, we'll just update the order status
      
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          status: "completed",
        })
        .eq("id", order.id);

      if (error) throw error;

      results.push({
        orderId: order.id,
        status: "completed",
        success: true,
      });
    } catch (error) {
      console.error(`Error processing order ${order.id}:`, error);
      results.push({
        orderId: order.id,
        status: "failed",
        error: error.message,
        success: false,
      });
    }
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}
