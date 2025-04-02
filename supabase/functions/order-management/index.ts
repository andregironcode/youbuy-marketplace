// @deno-types="https://deno.land/x/types/index.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DeliveryDetails {
  fullName: string
  locationType: string
  houseNumber: string
  buildingName: string
  apartmentNumber: string
  floor: string
  additionalInfo: string
  phone: string
  deliveryTime: string
  instructions: string
  latitude: number
  longitude: number
  formattedAddress: string
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

// Helper function to format delivery time
function formatDeliveryTime(deliveryTime: string): string {
  // Map delivery time preferences to specific times
  const timeMap: { [key: string]: string } = {
    'morning': '09:00:00',
    'afternoon': '14:00:00',
    'evening': '18:00:00',
    'night': '21:00:00'
  };

  // If the delivery time is already in HH:mm:ss format, return it
  if (/^\d{2}:\d{2}:\d{2}$/.test(deliveryTime)) {
    return deliveryTime;
  }

  // If it's a preference like 'morning', 'afternoon', etc., map it to a specific time
  if (timeMap[deliveryTime.toLowerCase()]) {
    return timeMap[deliveryTime.toLowerCase()];
  }

  // Default to 14:00:00 if no valid time is provided
  return '14:00:00';
}

// Helper function to format complete address string
function formatAddress(address: string, city: string, state: string, country: string, postal_code: string): string {
  const parts = [address, city, state, postal_code, country].filter(Boolean);
  return parts.join(', ');
}

// Helper function to parse formatted address
function parseFormattedAddress(formattedAddress: string): { address: string, city: string, state: string, country: string, postal_code: string } {
  const parts = formattedAddress.split(',').map(part => part.trim());
  
  // Handle the case where we have a full address with all components
  if (parts.length >= 4) {
    return {
      address: parts[0],
      city: parts[1],
      state: parts[2],
      country: parts[3],
      postal_code: parts[4] || '' // Postal code might not be present
    };
  }
  
  // Fallback if we don't have enough parts
  return {
    address: formattedAddress,
    city: '',
    state: '',
    country: '',
    postal_code: ''
  };
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
    const requestData = await req.json();
    console.log('Raw request data:', JSON.stringify(requestData, null, 2));
    
    const { orderId, productId, buyerId, sellerId, amount, deliveryDetails } = requestData as OrderRequest;
    console.log('Parsed request data:', {
      orderId,
      productId,
      buyerId,
      sellerId,
      amount,
      hasDeliveryDetails: !!deliveryDetails,
      deliveryDetailsType: typeof deliveryDetails,
      deliveryDetailsKeys: deliveryDetails ? Object.keys(deliveryDetails) : []
    });

    // Validate required fields
    if (!orderId || !productId || !buyerId || !sellerId || !amount) {
      console.error('Missing required fields in request:', {
        hasOrderId: !!orderId,
        hasProductId: !!productId,
        hasBuyerId: !!buyerId,
        hasSellerId: !!sellerId,
        hasAmount: !!amount
      });
      throw new Error('Missing required fields in request');
    }

    // Validate delivery details structure
    if (!deliveryDetails) {
      console.error('Delivery details are missing from request');
      throw new Error('Delivery details are required for order creation');
    }

    // Log the full delivery details object for debugging
    console.log('Full delivery details object:', JSON.stringify(deliveryDetails, null, 2));

    // Parse the formatted address into components
    const addressComponents = parseFormattedAddress(deliveryDetails.formattedAddress);
    console.log('Parsed address components:', addressComponents);

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

    // Build proper address strings from the data
    const actualCustomerAddress = [
      deliveryDetails.formattedAddress
    ].filter(Boolean).join(', ');
    
    console.log('Formatted customer address:', actualCustomerAddress);
    
    // Build restaurant address from product location
    const actualRestaurantAddress = [
      product.address || product.location,
      product.city,
      product.state,
      product.country,
      product.postal_code
    ].filter(Boolean).join(', ');
    
    console.log('Using actual customer address:', actualCustomerAddress);
    console.log('Using actual restaurant address:', actualRestaurantAddress);
    
    // Create payload with actual address data
    const payload = {
      orderNumber: orderId.toString(),
      // Customer information
      customerName: deliveryDetails.fullName || buyer.full_name || buyer.username || 'Customer',
      customerPhone: deliveryDetails.phone || buyer.phone || '',
      customerEmail: buyer.email || 'test@example.com',
      // Delivery information - using Shipday's expected field names
      deliveryAddress: actualCustomerAddress,
      deliveryLatitude: deliveryDetails.latitude || 0,
      deliveryLongitude: deliveryDetails.longitude || 0,
      // Pickup information
      pickupName: seller.full_name || seller.username || 'Restaurant',
      pickupPhone: seller.phone || '',
      pickupAddress: actualRestaurantAddress,
      pickupLatitude: product.latitude || 0,
      pickupLongitude: product.longitude || 0,
      // Order details
      expectedDeliveryDate: new Date().toISOString().split('T')[0],
      expectedDeliveryTime: formatDeliveryTime(deliveryDetails.deliveryTime),
      totalOrderCost: amount,
      deliveryFee: 0,
      deliveryInstruction: deliveryDetails.instructions || 'Please call upon arrival',
      orderSource: 'YouBuy Marketplace',
      items: [{
        name: product.title || 'Product',
        quantity: 1
      }]
    };
    
    console.log('Final payload (using actual addresses):', JSON.stringify(payload, null, 2));
    
    // Log environment variables
    console.log('SHIPDAY_API_URL:', SHIPDAY_API_URL);
    console.log('Using API Key (first 5 chars):', SHIPDAY_API_KEY?.substring(0, 5));
    
    // Use HTTP Basic Authentication per ShipDay documentation
    console.log('Calling ShipDay API with original authentication...');
    
    const response = await fetch(`${SHIPDAY_API_URL}/orders`, {
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
