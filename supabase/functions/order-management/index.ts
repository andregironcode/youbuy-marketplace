
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  orderId: string
  status: string
  notes?: string
  locationLat?: number
  locationLng?: number
  estimatedDelivery?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // Client with anonymous privileges
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Admin client with service_role privileges
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the authorization header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify token and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different endpoints
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Update order status endpoint
    if (path === 'update-status' && req.method === 'POST') {
      const { orderId, status, notes, locationLat, locationLng, estimatedDelivery } = await req.json() as RequestBody
      
      if (!orderId || !status) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // First check if the user is authorized for this order
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('seller_id, buyer_id')
        .eq('id', orderId)
        .single()
      
      if (orderError || !orderData) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Check if user is the seller, buyer, or admin
      const isAdmin = await checkIfAdmin(supabaseClient, user.id)
      const isAuthorized = orderData.seller_id === user.id || orderData.buyer_id === user.id || isAdmin
      
      if (!isAuthorized) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to update this order' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Update order status
      const { data: statusData, error: statusError } = await supabaseClient.rpc(
        'update_order_status',
        {
          p_order_id: orderId,
          p_status: status,
          p_notes: notes || null,
          p_location_lat: locationLat || null,
          p_location_lng: locationLng || null
        }
      )
      
      if (statusError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update status', details: statusError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // If estimated delivery is provided, update it
      if (estimatedDelivery) {
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({ estimated_delivery: estimatedDelivery })
          .eq('id', orderId)
        
        if (updateError) {
          console.error('Error updating estimated delivery:', updateError)
        }
      }
      
      // Create notification for the other party
      let notifyUserId: string
      let notificationTitle: string
      let notificationDescription: string
      
      // Determine who to notify and what message to send
      if (orderData.seller_id === user.id) {
        notifyUserId = orderData.buyer_id
        notificationTitle = 'Order Status Updated'
        notificationDescription = `The seller has updated your order status to: ${status}`
      } else {
        notifyUserId = orderData.seller_id
        notificationTitle = 'Order Status Updated'
        notificationDescription = `The buyer has updated order status to: ${status}`
      }
      
      // Insert notification - use admin client to bypass RLS
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          type: 'order_update',
          title: notificationTitle,
          description: notificationDescription,
          related_id: orderId,
          read: false
        })
      
      return new Response(
        JSON.stringify({ success: true, data: statusData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get order tracking info endpoint
    else if (path === 'tracking' && req.method === 'GET') {
      const orderId = url.searchParams.get('orderId')
      
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: 'Order ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Check authorization
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('seller_id, buyer_id')
        .eq('id', orderId)
        .single()
      
      if (orderError || !orderData) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const isAdmin = await checkIfAdmin(supabaseClient, user.id)
      const isAuthorized = orderData.seller_id === user.id || orderData.buyer_id === user.id || isAdmin
      
      if (!isAuthorized) {
        return new Response(
          JSON.stringify({ error: 'Not authorized to view this order' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Get tracking info
      const { data: trackingData, error: trackingError } = await supabaseClient
        .from('order_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single()
      
      if (trackingError) {
        return new Response(
          JSON.stringify({ error: 'Failed to get tracking info', details: trackingError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true, data: trackingData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Default response for invalid endpoints
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to check if a user is an admin
async function checkIfAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()
  
  if (error || !data) {
    return false
  }
  
  return data.role === 'admin'
}
