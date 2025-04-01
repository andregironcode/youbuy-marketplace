// @deno-types="https://deno.land/x/types/index.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DeliveryDetails {
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  latitude?: number
  longitude?: number
  instructions?: string
}

interface OrderRequest {
  orderId: string
  productId: string
  buyerId: string
  sellerId: string
  amount: number
  deliveryDetails: DeliveryDetails
}

interface ShipdayOrder {
  orderNumber: string
  customerName: string
  customerAddress: string
  customerEmail: string
  customerPhoneNumber: string
  restaurantName: string
  restaurantPhoneNumber: string
  pickupName: string
  pickupAddress: string
  pickupPhoneNumber: string
  deliveryAddress: string
  expectedDeliveryDate: string
  expectedDeliveryTime: string
  pickupLatitude: number
  pickupLongitude: number
  deliveryLatitude: number
  deliveryLongitude: number
  totalOrderCost: number
  deliveryFee: number
  deliveryInstruction: string
  orderSource: string
  items: Array<{
    name: string
    quantity: number
  }>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Shipday API configuration
const SHIPDAY_API_KEY = Deno.env.get('SHIPDAY_API_KEY')
if (!SHIPDAY_API_KEY) {
  throw new Error('SHIPDAY_API_KEY is not set')
}
const SHIPDAY_API_URL = 'https://api.shipday.com'

// Helper function to format complete address string
function formatAddress(address: string, city: string, state: string, country: string, postal_code: string): string {
  const parts = [address, city, state, postal_code, country].filter(Boolean);
  return parts.join(', ');
}

// Shipday API helper functions
async function createShipdayOrder(orderData: any) {
  if (!SHIPDAY_API_KEY) {
    console.error('Cannot create Shipday order: API key not configured')
    return null
  }

  try {
    const response = await fetch(`${SHIPDAY_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SHIPDAY_API_KEY
      },
      body: JSON.stringify({
        orderNumber: orderData.id,
        customerName: orderData.buyer_name,
        customerPhone: orderData.buyer_phone,
        customerAddress: formatAddress(
          orderData.delivery_address,
          orderData.delivery_city,
          orderData.delivery_state,
          orderData.delivery_postal_code,
          orderData.delivery_country
        ),
        customerLatitude: orderData.delivery_latitude,
        customerLongitude: orderData.delivery_longitude,
        pickupName: orderData.seller_name,
        pickupPhone: orderData.seller_phone,
        pickupAddress: formatAddress(
          orderData.pickup_address,
          orderData.pickup_city,
          orderData.pickup_state,
          orderData.pickup_postal_code,
          orderData.pickup_country
        ),
        pickupLatitude: orderData.pickup_latitude,
        pickupLongitude: orderData.pickup_longitude,
        items: [{
          name: orderData.product_title,
          quantity: 1
        }],
        status: 'pending'
      })
    })

    if (!response.ok) {
      throw new Error(`Shipday API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating Shipday order:', error)
    return null
  }
}

async function updateShipdayOrderStatus(orderNumber: string, status: string, notes?: string) {
  if (!SHIPDAY_API_KEY) {
    console.error('Cannot update Shipday order: API key not configured')
    return null
  }

  try {
    const response = await fetch(`${SHIPDAY_API_URL}/orders/${orderNumber}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SHIPDAY_API_KEY
      },
      body: JSON.stringify({
        status,
        notes
      })
    })

    if (!response.ok) {
      throw new Error(`Shipday API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating Shipday order status:', error)
    return null
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Get order data from request
    const { orderId, productId, buyerId, sellerId, amount, deliveryDetails } = await req.json() as OrderRequest
    console.log('Received request with data:', { orderId, productId, buyerId, sellerId, amount });
    console.log('Delivery details received:', JSON.stringify(deliveryDetails, null, 2));

    // Validate required fields
    if (!orderId || !productId || !buyerId || !sellerId || !amount || !deliveryDetails) {
      console.error('Missing required fields in request');
      throw new Error('Missing required fields')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch product details
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError);
      throw new Error('Product not found')
    }
    
    // Log RAW data in full detail
    console.log('DEBUGGING RAW DATA:');
    console.log('Raw delivery details:', JSON.stringify(deliveryDetails, null, 2));
    console.log('Raw product location:', {
      location: product.location,
      latitude: product.latitude,
      longitude: product.longitude,
      city: product.city,
      state: product.state,
      country: product.country,
      postal_code: product.postal_code
    });

    // Fetch buyer details
    const { data: buyer, error: buyerError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', buyerId)
      .single()

    if (buyerError || !buyer) {
      console.error('Error fetching buyer:', buyerError);
      throw new Error('Buyer not found')
    }

    // Fetch seller details
    const { data: seller, error: sellerError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', sellerId)
      .single()

    if (sellerError || !seller) {
      console.error('Error fetching seller:', sellerError);
      throw new Error('Seller not found')
    }

    // IMPORTANT: Use extremely simple addresses as baseline test
    const simpleCustomerAddress = "123 Main St";
    const simpleRestaurantAddress = "456 Market St";
    
    // Format addresses but don't filter characters
    const customerAddress = formatAddress(
      deliveryDetails.address,
      deliveryDetails.city || '',
      deliveryDetails.state || '',
      deliveryDetails.country || '',
      deliveryDetails.postal_code || ''
    );
    
    const restaurantAddress = formatAddress(
      product.location || 'Pickup Location',
      product.city || '',
      product.state || '',
      product.postal_code || '',
      product.country || ''
    );
    
    console.log('COMPARING ADDRESSES:');
    console.log('Simple customer address:', simpleCustomerAddress);
    console.log('Formatted customer address:', customerAddress);
    console.log('Simple restaurant address:', simpleRestaurantAddress);
    console.log('Formatted restaurant address:', restaurantAddress);
    
    // Create payload based on known working format from test order
    // Include ONLY the fields that the test script includes - nothing more, nothing less
    const payload = {
      orderNumber: orderId.toString(),
      customerName: buyer.full_name || buyer.username || 'Customer',
      customerAddress: deliveryDetails.address, // Use JUST the street address, not the full formatted one
      customerEmail: buyer.email || 'test@example.com',
      customerPhoneNumber: buyer.phone || '',
      restaurantName: seller.full_name || seller.username || 'Restaurant',
      restaurantAddress: product.location || "456 Restaurant St", // Use JUST the location field
      restaurantPhoneNumber: seller.phone || '',
      expectedDeliveryDate: new Date().toISOString().split('T')[0],
      expectedDeliveryTime: '12:00:00',
      pickupLatitude: product.latitude || 0,
      pickupLongitude: product.longitude || 0,
      deliveryLatitude: deliveryDetails.latitude || 0,
      deliveryLongitude: deliveryDetails.longitude || 0,
      totalOrderCost: amount,
      deliveryFee: 0,
      deliveryInstruction: 'Please call upon arrival',
      orderSource: 'YouBuy Marketplace',
      items: [{
        name: product.title || 'Product',
        quantity: 1
      }]
    };
    
    console.log('Final payload (exact test match format):', JSON.stringify(payload, null, 2));
    
    // Log environment variables
    console.log('SHIPDAY_API_URL:', SHIPDAY_API_URL);
    console.log('Using API Key (first 5 chars):', SHIPDAY_API_KEY?.substring(0, 5));
    
    // Validate by sending a GET request first to see the format of existing orders
    console.log('Fetching existing orders to validate format...');
    try {
      const validateResponse = await fetch(`${SHIPDAY_API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${SHIPDAY_API_KEY}`
        }
      });
      
      if (validateResponse.ok) {
        const existingOrders = await validateResponse.json();
        console.log('Found existing orders:', JSON.stringify(existingOrders, null, 2));
        if (existingOrders && existingOrders.length > 0) {
          console.log('Sample order format:', JSON.stringify(existingOrders[0], null, 2));
          // Check if restaurantAddress is present and what field names are used
          const addressFields = [];
          for (const key in existingOrders[0]) {
            if (key.toLowerCase().includes('address') || key.toLowerCase().includes('location')) {
              addressFields.push(key);
            }
          }
          console.log('Fields containing address or location:', addressFields);
        }
      } else {
        console.log('Failed to fetch existing orders:', await validateResponse.text());
      }
    } catch (e) {
      console.error('Error fetching existing orders:', e);
    }
    
    // Use HTTP Basic Authentication per ShipDay documentation exactly as in test script
    console.log('Calling ShipDay API with correct Basic authentication...');
    
    let response = await fetch(`${SHIPDAY_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${SHIPDAY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status);
    
    // Handle response
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('Success! Response data:', JSON.stringify(data, null, 2));
        
        // Update order with Shipday reference
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({ 
            shipday_order_id: data.orderId || data.id,
            status: 'processing'
          })
          .eq('id', orderId);
        
        if (updateError) {
          console.error('Error updating order with Shipday reference:', updateError);
        }
        
        return new Response(JSON.stringify({
          success: true,
          shipday_order_id: data.orderId || data.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (e) {
        console.log('Error parsing JSON response:', e);
        const text = await response.text();
        console.log('Raw successful response:', text);
        return new Response(JSON.stringify({
          success: true,
          message: 'Order created but could not parse response',
          text: text
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    } else {
      // Handle error response
      const errorText = await response.text();
      console.error(`Error details: ${response.status} ${errorText}`);
      throw new Error(`Shipday API error: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
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
