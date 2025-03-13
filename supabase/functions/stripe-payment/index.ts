
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
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

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

    if (path === "create-payment-intent") {
      return await handleCreatePaymentIntent(req);
    } else if (path === "create-connect-account") {
      return await handleCreateConnectAccount(req);
    } else if (path === "webhook") {
      return await handleWebhook(req);
    } else if (path === "confirm-delivery") {
      return await handleConfirmDelivery(req);
    } else if (path === "create-dispute") {
      return await handleCreateDispute(req);
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

async function handleCreatePaymentIntent(req) {
  const { orderId, amount, buyerId, sellerId, productId } = await req.json();

  // Get the platform fee
  const { data: platformFeeData } = await supabase
    .from("platform_fees")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  const feePercentage = platformFeeData?.fee_percentage || 5.0;
  const minimumFee = platformFeeData?.minimum_fee || 1.0;

  // Calculate application fee (platform fee)
  const platformFeeAmount = Math.max(
    Math.round(amount * (feePercentage / 100) * 100),
    minimumFee * 100
  );

  // Get seller's Stripe account ID
  const { data: sellerAccount } = await supabase
    .from("seller_accounts")
    .select("stripe_account_id")
    .eq("user_id", sellerId)
    .maybeSingle();

  if (!sellerAccount?.stripe_account_id) {
    return new Response(
      JSON.stringify({ error: "Seller doesn't have a connected Stripe account" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: "aed",
    application_fee_amount: platformFeeAmount,
    transfer_data: {
      destination: sellerAccount.stripe_account_id,
    },
    metadata: {
      orderId,
      buyerId,
      sellerId,
      productId,
    },
    capture_method: "manual", // Important for escrow - we'll capture later
  });

  // Update order with payment intent ID
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      stripe_payment_intent_id: paymentIntent.id,
      payment_status: "awaiting_payment",
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("Error updating order:", updateError);
  }

  return new Response(
    JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function handleCreateConnectAccount(req) {
  const { userId, email, name } = await req.json();

  // Check if user already has a Stripe account
  const { data: existingAccount } = await supabase
    .from("seller_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingAccount?.stripe_account_id) {
    // If account exists but needs to be completed
    const accountLink = await stripe.accountLinks.create({
      account: existingAccount.stripe_account_id,
      refresh_url: `${req.headers.get("origin")}/profile/sales`,
      return_url: `${req.headers.get("origin")}/profile/sales?setup=success`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({ url: accountLink.url, accountId: existingAccount.stripe_account_id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }

  // Create a new Connect account
  const account = await stripe.accounts.create({
    type: "express",
    email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      userId,
    },
  });

  // Store Stripe account ID in database
  await supabase.from("seller_accounts").insert({
    user_id: userId,
    stripe_account_id: account.id,
    account_status: "pending",
  });

  // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${req.headers.get("origin")}/profile/sales`,
    return_url: `${req.headers.get("origin")}/profile/sales?setup=success`,
    type: "account_onboarding",
  });

  return new Response(
    JSON.stringify({ url: accountLink.url, accountId: account.id }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function handleWebhook(req) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(
      JSON.stringify({ error: "Webhook signature verification failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "account.updated":
      await handleConnectAccountUpdated(event.data.object);
      break;

    // Add more event handlers as needed
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { orderId } = paymentIntent.metadata;

  // Update order status
  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "processing", // Product being prepared for delivery
    })
    .eq("id", orderId);

  // Capture the payment (for manual capture_method)
  await stripe.paymentIntents.capture(paymentIntent.id);
}

async function handleConnectAccountUpdated(account) {
  // Update seller account status based on Stripe account updates
  await supabase
    .from("seller_accounts")
    .update({
      account_status: account.details_submitted ? "active" : "pending",
      charges_enabled: account.charges_enabled,
      payout_enabled: account.payouts_enabled,
    })
    .eq("stripe_account_id", account.id);
}

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

  // Schedule a function to release payment after dispute window
  // In a real app, you would set up a cron job or a scheduled function
  // For now, we'll rely on a webhook or manual check

  return new Response(
    JSON.stringify({ success: true, disputeDeadline: disputeDeadline.toISOString() }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function handleCreateDispute(req) {
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

  // In a real app, you would notify customer support and the seller

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}
