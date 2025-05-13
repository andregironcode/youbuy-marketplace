
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Location = {
  address: string;
  latitude: number;
  longitude: number;
};

type Stop = {
  id: string;
  type: 'pickup' | 'delivery';
  orderId: string;
  location: Location;
  personName: string;
  productTitle: string;
  preferredTime: string | null;
};

interface Profile {
  id: string;
  full_name: string | null;
}

interface Product {
  id: string;
  title: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface DeliveryDetails {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  preferred_time?: string | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  products: Product | null;
  delivery_details: DeliveryDetails | string | null;
  buyer_id: string;
  seller_id: string;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Simple nearest neighbor algorithm for route optimization
function optimizeRoute(stops: Stop[], startLat: number, startLng: number): Stop[] {
  if (stops.length <= 1) return stops;

  const optimizedRoute: Stop[] = [];
  const unvisited = [...stops];

  let currentLat = startLat;
  let currentLng = startLng;

  // Place stops with preferred times first
  const scheduledStops = unvisited.filter(stop => stop.preferredTime);
  scheduledStops.sort((a, b) => {
    if (!a.preferredTime) return 1;
    if (!b.preferredTime) return -1;
    return a.preferredTime.localeCompare(b.preferredTime);
  });

  // Add scheduled stops to the optimized route
  scheduledStops.forEach(stop => {
    const index = unvisited.findIndex(s => s.id === stop.id);
    if (index !== -1) {
      optimizedRoute.push(stop);
      unvisited.splice(index, 1);
    }
  });

  // Use nearest neighbor for remaining stops
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDistance = Number.MAX_VALUE;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLat, 
        currentLng, 
        unvisited[i].location.latitude, 
        unvisited[i].location.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited[nearestIndex];
    optimizedRoute.push(nextStop);
    currentLat = nextStop.location.latitude;
    currentLng = nextStop.location.longitude;
    unvisited.splice(nearestIndex, 1);
  }

  return optimizedRoute;
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

    // Admin client with service_role privileges
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get request data
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Handle manual route generation or respond to scheduled trigger
    if ((path === 'generate-routes' && req.method === 'POST') || req.method === 'GET') {
      // Get parameters
      let timeSlot: 'morning' | 'afternoon' = 'morning';
      let date = new Date();

      if (req.method === 'POST') {
        const { requestedTimeSlot, requestedDate } = await req.json();
        timeSlot = requestedTimeSlot || timeSlot;
        if (requestedDate) {
          date = new Date(requestedDate);
        }
      } else {
        // For scheduled runs, determine time slot based on current time
        const currentHour = new Date().getHours();
        timeSlot = currentHour >= 13 ? 'afternoon' : 'morning';
      }

      // Format the date to YYYY-MM-DD for database query
      const formattedDate = date.toISOString().split('T')[0];

      // Set time boundaries based on the selected time slot
      const startTime = timeSlot === 'morning' ? '19:00:00' : '13:00:00';
      const endTime = timeSlot === 'morning' ? '13:00:00' : '19:00:00';

      // Since we're checking orders from the previous evening (7pm) if morning slot
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - (timeSlot === 'morning' ? 1 : 0));
      const formattedPreviousDay = previousDay.toISOString().split('T')[0];


      // Query to get orders within the time range
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          products:product_id (
            id,
            title,
            location,
            latitude,
            longitude
          ),
          delivery_details,
          buyer_id,
          seller_id
        `)
        .gte('created_at', `${formattedPreviousDay} ${startTime}`)
        .lte('created_at', `${formattedDate} ${endTime}`)
        .neq('status', 'delivered')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

      if (ordersError) {
        throw ordersError;
      }


      // Fetch buyer and seller profiles
      const buyerIds = (orders || []).map(order => order.buyer_id).filter(Boolean);
      const sellerIds = (orders || []).map(order => order.seller_id).filter(Boolean);

      const { data: buyerProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', buyerIds.length > 0 ? buyerIds : ['00000000-0000-0000-0000-000000000000']);

      const { data: sellerProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', sellerIds.length > 0 ? sellerIds : ['00000000-0000-0000-0000-000000000000']);

      // Create lookup maps for buyer and seller names
      const buyerMap: Record<string, string> = Object.fromEntries(
        (buyerProfiles || []).map((profile: Profile) => [profile.id, profile.full_name || 'Unknown Buyer'])
      );

      const sellerMap: Record<string, string> = Object.fromEntries(
        (sellerProfiles || []).map((profile: Profile) => [profile.id, profile.full_name || 'Unknown Seller'])
      );

      // Collect pickup and delivery stops
      const pickupStops: Stop[] = [];
      const deliveryStops: Stop[] = [];

      (orders || []).forEach((order: Order) => {
        // Add pickup stop
        if (order.products && order.products.latitude && order.products.longitude) {
          pickupStops.push({
            id: `pickup-${order.id}`,
            type: 'pickup',
            orderId: order.id,
            location: {
              address: order.products.location || 'Unknown Location',
              latitude: order.products.latitude || 0,
              longitude: order.products.longitude || 0,
            },
            personName: sellerMap[order.seller_id] || 'Unknown Seller',
            productTitle: order.products.title || 'Unknown Product',
            preferredTime: null, // Pickups don't typically have preferred times
          });
        }

        // Add delivery stop
        let deliveryLocation;
        let preferredTime = null;

        try {
          if (typeof order.delivery_details === 'string') {
            const parsedDetails = JSON.parse(order.delivery_details);
            deliveryLocation = {
              address: parsedDetails.address || 'Unknown Location',
              latitude: parsedDetails.latitude || 0,
              longitude: parsedDetails.longitude || 0,
            };
            preferredTime = parsedDetails.preferred_time || null;
          } else if (order.delivery_details) {
            deliveryLocation = {
              address: order.delivery_details.address || 'Unknown Location',
              latitude: order.delivery_details.latitude || 0,
              longitude: order.delivery_details.longitude || 0,
            };
            preferredTime = order.delivery_details.preferred_time || null;
          }
        } catch (e) {
          console.error(`Error parsing delivery details for order ${order.id}:`, e);
        }

        if (deliveryLocation && deliveryLocation.latitude && deliveryLocation.longitude) {
          deliveryStops.push({
            id: `delivery-${order.id}`,
            type: 'delivery',
            orderId: order.id,
            location: deliveryLocation,
            personName: buyerMap[order.buyer_id] || 'Unknown Buyer',
            productTitle: order.products?.title || 'Unknown Product',
            preferredTime,
          });
        }
      });

      // Optimize routes (using a central location as starting point - this could be the warehouse or depot)
      // In a real implementation, you would use the actual location of your depot
      const centralLat = 40.7128; // Example: NYC latitude
      const centralLng = -74.0060; // Example: NYC longitude

      const optimizedPickupRoute = optimizeRoute(pickupStops, centralLat, centralLng);
      const optimizedDeliveryRoute = optimizeRoute(deliveryStops, centralLat, centralLng);


      // Store the optimized routes in the database
      const routeData = {
        date: formattedDate,
        time_slot: timeSlot,
        created_at: new Date().toISOString(),
        pickup_route: optimizedPickupRoute,
        delivery_route: optimizedDeliveryRoute,
        status: 'active'
      };

      const { data: insertedRoute, error: insertError } = await supabaseAdmin
        .from('delivery_routes')
        .upsert([routeData], { 
          onConflict: 'date,time_slot',
          ignoreDuplicates: false
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully generated routes for ${formattedDate}, ${timeSlot}`,
          route_id: insertedRoute?.[0]?.id,
          pickup_stops: optimizedPickupRoute.length,
          delivery_stops: optimizedDeliveryRoute.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default response for invalid endpoints
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint or method' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in route optimization:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage,
        stack: errorStack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
