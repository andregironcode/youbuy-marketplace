import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createRequire } from 'module';

// Create require function for importing CommonJS modules
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Optional environment variables
const optionalEnvVars = [
  'SHIPDAY_API_KEY',
  'SHIPDAY_API_URL'
];

// Check required env vars
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Check if ShipDay integration is available
const isShipDayEnabled = optionalEnvVars.every(envVar => !!process.env[envVar]);
if (!isShipDayEnabled) {
  console.warn('ShipDay integration is disabled. Some environment variables are missing:');
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`- Missing ${envVar}`);
    }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Custom error classes for better error handling
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class RouteOverlapError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RouteOverlapError';
  }
}

class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

class ShipDayError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'ShipDayError';
    this.originalError = originalError;
  }
}

function parseAddress(addressString) {
  // Split address into components
  const parts = addressString.split(',').map(part => part.trim());
  return {
    unit: '', // Optional
    street: parts[0] || '',
    city: parts[1] || 'Dubai',
    state: parts[2] || 'Dubai',
    zip: '', // Optional
    country: parts[3] || 'UAE'
  };
}

// Send order to ShipDay using the API directly
async function sendOrderToShipDay(order) {
  // Skip ShipDay integration if disabled
  if (!isShipDayEnabled) {
    console.log('ShipDay integration is disabled. Skipping API call.');
    return { 
      success: false, 
      message: 'ShipDay integration is disabled',
      disabled: true
    };
  }

  try {
    // Get the first order from the array if it's an array
    const orderData = Array.isArray(order) ? order[0] : order;
    
    console.log('Order data for ShipDay:', JSON.stringify(orderData, null, 2));
    
    // Create ShipDay order payload based on their API documentation
    const payload = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.customer.name,
      customerAddress: orderData.customer.address.street,
      customerEmail: orderData.customer.email || 'test@example.com',
      customerPhoneNumber: orderData.customer.phone,
      restaurantName: orderData.pickup.name,
      restaurantAddress: orderData.pickup.address.street,
      restaurantPhoneNumber: orderData.pickup.phone,
      expectedDeliveryDate: orderData.deliveryDate,
      expectedDeliveryTime: '12:00:00',
      pickupLatitude: orderData.pickup.address.latitude,
      pickupLongitude: orderData.pickup.address.longitude,
      deliveryLatitude: orderData.customer.address.latitude,
      deliveryLongitude: orderData.customer.address.longitude,
      totalOrderCost: orderData.orderAmount,
      deliveryFee: orderData.deliveryFee,
      deliveryInstruction: orderData.delivery.instructions,
      orderSource: orderData.orderSource,
      items: orderData.items
    };
    
    // The base URL from the env is https://api.shipday.com/v1
    // According to docs, the endpoint for orders should be directly at /orders
    // So let's try both versions (with and without the /v1 prefix)
    const apiBaseUrl = process.env.SHIPDAY_API_URL;
    const apiUrlWithoutV1 = apiBaseUrl.replace('/v1', '');
    
    console.log('ShipDay API Base URL:', apiBaseUrl);
    console.log('ShipDay API Key (first 5 chars):', process.env.SHIPDAY_API_KEY?.substring(0, 5));
    
    // Using HTTP Basic Authentication per ShipDay documentation
    // https://docs.shipday.com/reference/authentication
    console.log('Calling ShipDay API with correct Basic authentication...');
    
    try {
      // First try with the original URL
      console.log('Trying endpoint with /v1:', `${apiBaseUrl}/orders`);
      let response = await fetch(`${apiBaseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${process.env.SHIPDAY_API_KEY}`
        },
        body: JSON.stringify(payload)
      });
      
      // If that fails with 404, try without /v1
      if (response.status === 404) {
        console.log('First endpoint returned 404, trying without /v1:', `${apiUrlWithoutV1}/orders`);
        response = await fetch(`${apiUrlWithoutV1}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.SHIPDAY_API_KEY}`
          },
          body: JSON.stringify(payload)
        });
      }
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('ShipDay order created successfully:', responseData);
        return {
          success: true,
          order_id: responseData.orderId || responseData.id
        };
      }
      
      // Handle error
      const status = response.status;
      let errorText = '';
      
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error details';
      }
      
      console.error(`ShipDay API request failed with status ${status}:`, errorText);
      
      if (status === 401 || status === 403) {
        console.error('Authentication error. Please check your ShipDay API key and ensure it is correctly formatted.');
        console.error('The key should be used directly with the "Basic" prefix in the Authorization header.');
      } else if (status === 400) {
        console.error('Bad request. Please check the payload format.');
      } else if (status === 404) {
        console.error('Endpoint not found. Please verify the ShipDay API URL.');
      } else if (status >= 500) {
        console.error('Server error. Please try again later.');
      }
      
      return {
        success: false,
        status,
        error: errorText,
        message: `ShipDay API request failed with status ${status}`
      };
    } catch (apiError) {
      console.error('ShipDay API network error:', apiError);
      return {
        success: false,
        error: apiError.message,
        message: 'ShipDay API network error'
      };
    }
  } catch (error) {
    console.error('ShipDay API error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error preparing ShipDay order data'
    };
  }
}

// Format order for ShipDay SDK
async function formatOrderForShipDay(order, route) {
  const deliveryDetails = order.delivery_details;

  // Fetch seller information
  const { data: seller, error: sellerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', order.seller_id)
    .single();

  if (sellerError) {
    throw new DatabaseError('Failed to fetch seller information', sellerError);
  }

  if (!seller) {
    throw new ValidationError('Seller information not found');
  }

  // Format the order according to ShipDay SDK requirements
  return {
    orderNumber: order.id,
    orderDate: new Date(order.created_at).toISOString(),
    deliveryDate: new Date(route.scheduled_time).toISOString().split('T')[0],
    deliveryWindow: deliveryDetails.preferred_delivery_window || '09:00-12:00',
    customer: {
      name: deliveryDetails.contact_name || 'Unknown',
      address: {
        street: deliveryDetails.delivery_address || 'Unknown Address',
        latitude: deliveryDetails.delivery_coordinates[0],
        longitude: deliveryDetails.delivery_coordinates[1]
      },
      phone: deliveryDetails.contact_phone || 'Unknown Phone',
      email: ''
    },
    pickup: {
      name: seller.full_name || seller.username || 'Seller',
      address: {
        street: deliveryDetails.pickup_address,
        latitude: deliveryDetails.pickup_coordinates[0],
        longitude: deliveryDetails.pickup_coordinates[1]
      },
      phone: seller.phone || deliveryDetails.contact_phone,
      instructions: deliveryDetails.delivery_instructions || 'Please call upon arrival'
    },
    delivery: {
      instructions: deliveryDetails.delivery_instructions || 'Please call upon arrival'
    },
    amount: order.amount || 0,
    orderAmount: order.amount || 0,
    deliveryFee: deliveryDetails.delivery_cost || 0,
    totalAmount: (order.amount || 0) + (deliveryDetails.delivery_cost || 0),
    orderSource: 'YouBuy Marketplace',
    additionalId: order.id,
    items: [
      {
        name: 'Package',
        quantity: 1,
        unitPrice: order.amount,
        addon: `Weight: ${deliveryDetails.package_weight || '1kg'}, Dimensions: ${deliveryDetails.package_dimensions || '30x20x15cm'}`
      }
    ],
    status: 'ORDERED'
  };
}

// Validation functions
function validateCoordinates(lat, lng) {
  if (!lat || !lng) {
    throw new ValidationError('Coordinates are required');
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new ValidationError('Coordinates must be numbers');
  }
  if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) {
    throw new ValidationError('Invalid coordinates: must be within valid ranges');
  }
  return true;
}

function validateTimeSlot(timeSlot) {
  const validTimeSlots = ['morning', 'afternoon', 'evening'];
  if (!timeSlot || typeof timeSlot !== 'string') {
    throw new ValidationError('Time slot is required and must be a string');
  }
  if (!validTimeSlots.includes(timeSlot.toLowerCase())) {
    throw new ValidationError(`Invalid time slot: must be one of ${validTimeSlots.join(', ')}`);
  }
  return true;
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('Address is required and must be a string');
  }
  if (address.length < 5) {
    throw new ValidationError('Invalid address: must be at least 5 characters');
  }
  return true;
}

function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new ValidationError('Phone number is required and must be a string');
  }
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number: must be in E.164 format (e.g., +971501234567)');
  }
  return true;
}

function validateDeliveryDetails(details) {
  if (!details || typeof details !== 'object') {
    throw new ValidationError('Delivery details are required and must be an object');
  }

  // Required fields
  const requiredFields = [
    'pickup_address',
    'delivery_address',
    'pickup_coordinates',
    'delivery_coordinates',
    'contact_name',
    'contact_phone'
  ];

  for (const field of requiredFields) {
    if (!details[field]) {
      throw new ValidationError(`Missing required delivery detail: ${field}`);
    }
  }

  // Validate coordinates arrays
  if (!Array.isArray(details.pickup_coordinates) || details.pickup_coordinates.length !== 2) {
    throw new ValidationError('Pickup coordinates must be an array with [latitude, longitude]');
  }
  if (!Array.isArray(details.delivery_coordinates) || details.delivery_coordinates.length !== 2) {
    throw new ValidationError('Delivery coordinates must be an array with [latitude, longitude]');
  }

  // Validate other fields
  validateAddress(details.pickup_address);
  validateAddress(details.delivery_address);
  validatePhoneNumber(details.contact_phone);

  return true;
}

async function checkRouteOverlap(date, timeSlot) {
  try {
    // Get the start and end times for the given date and time slot
    let startTime, endTime;
    switch (timeSlot) {
      case 'morning':
        startTime = new Date(`${date}T06:00:00Z`);
        endTime = new Date(`${date}T12:00:00Z`);
        break;
      case 'afternoon':
        startTime = new Date(`${date}T12:00:00Z`);
        endTime = new Date(`${date}T18:00:00Z`);
        break;
      case 'evening':
        startTime = new Date(`${date}T18:00:00Z`);
        endTime = new Date(`${date}T23:59:59Z`);
        break;
      default:
        throw new ValidationError('Invalid time slot');
    }

    const { data: existingRoutes, error } = await supabase
      .from('delivery_routes')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .lt('created_at', endTime.toISOString());
    
    if (error) {
      throw new DatabaseError('Failed to check route overlap', error);
    }
    
    return existingRoutes?.length || 0;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to check route overlap', error);
  }
}

async function createTestOrder() {
  try {
    // Using existing IDs
    const buyerId = '565cee53-5574-429f-87c7-8fd5493b59ca';
    const sellerId = '565cee53-5574-429f-87c7-8fd5493b59ca';
    const productId = '6b72e227-c4a2-4726-874d-8f30eced0622';

    // Delivery information
    const deliveryDetails = {
      pickup_address: '123 Pickup St, Dubai, UAE',
      delivery_address: '456 Delivery Ave, Dubai, UAE',
      pickup_coordinates: [25.2048, 55.2708],
      delivery_coordinates: [25.1972, 55.2744],
      contact_name: 'Test Customer',
      contact_phone: '+971501234567',
      delivery_instructions: 'Please call upon arrival',
      package_weight: '2.5kg',
      package_dimensions: '30x20x15cm',
      delivery_cost: 25.00,
      preferred_delivery_window: '9:00 AM - 12:00 PM'
    };

    // Validate delivery details
    validateDeliveryDetails(deliveryDetails);

    // Check for route overlaps
    const deliveryDate = new Date().toISOString().split('T')[0];
    const timeSlot = 'morning';
    const overlappingRoutes = await checkRouteOverlap(deliveryDate, timeSlot);
    if (overlappingRoutes > 5) {
      throw new RouteOverlapError(`Time slot is full: ${overlappingRoutes} existing routes`);
    }

    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          product_id: productId,
          buyer_id: buyerId,
          seller_id: sellerId,
          amount: 100.00,
          status: 'pending',
          payment_status: 'paid',
          current_stage: 'pending',
          delivery_details: deliveryDetails,
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_updated_by: sellerId
        }
      ])
      .select();

    if (orderError) {
      throw new DatabaseError('Failed to create order', orderError);
    }
    console.log('Created order:', order);

    // Create a delivery route linked to the order
    const { data: route, error: routeError } = await supabase
      .from('delivery_routes')
      .insert([
        {
          order_id: order[0].id,
          pickup_address: deliveryDetails.pickup_address,
          delivery_address: deliveryDetails.delivery_address,
          pickup_lat: deliveryDetails.pickup_coordinates[0],
          pickup_lng: deliveryDetails.pickup_coordinates[1],
          delivery_lat: deliveryDetails.delivery_coordinates[0],
          delivery_lng: deliveryDetails.delivery_coordinates[1],
          status: 'pending',
          scheduled_time: new Date().toISOString(),
          customer_name: deliveryDetails.contact_name,
          customer_phone: deliveryDetails.contact_phone,
          date: new Date().toISOString(),
          time_slot: 'morning'
        }
      ])
      .select();

    if (routeError) {
      console.error('Route creation error details:', routeError);
      // Rollback by deleting the order
      await supabase.from('orders').delete().eq('id', order[0].id);
      throw new DatabaseError('Failed to create delivery route', routeError);
    }
    console.log('Created delivery route:', route);

    // Create a status history entry linked to the order
    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .insert([
        {
          order_id: order[0].id,
          status: 'pending',
          notes: 'Order created and scheduled for delivery',
          location_lat: deliveryDetails.pickup_coordinates[0],
          location_lng: deliveryDetails.pickup_coordinates[1],
          created_by: sellerId
        }
      ])
      .select();

    if (historyError) {
      // Rollback by deleting the order and route
      await supabase.from('delivery_routes').delete().eq('id', route[0].id);
      await supabase.from('orders').delete().eq('id', order[0].id);
      throw new DatabaseError('Failed to create status history', historyError);
    }
    console.log('Created status history:', history);

    // After successful creation, format for ShipDay
    const shipDayOrder = await formatOrderForShipDay(order[0], route[0]);
    console.log('ShipDay formatted order:', JSON.stringify(shipDayOrder, null, 2));

    // Send order to ShipDay
    const shipDayResponse = await sendOrderToShipDay(shipDayOrder);
    console.log('ShipDay API response:', shipDayResponse);

    // Update order with ShipDay reference if successful
    if (shipDayResponse.success && shipDayResponse.order_id) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          shipday_order_id: shipDayResponse.order_id,
          last_updated_by: order[0].seller_id
        })
        .eq('id', order[0].id);

      if (updateError) {
        console.warn('Failed to update order with ShipDay reference:', updateError);
      }
    } else {
      console.warn('ShipDay integration was not successful. Order created in database only.');
    }

    return {
      success: true,
      order: order[0],
      route: route[0],
      history: history[0],
      shipDayOrder,
      shipDayResponse
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message,
      errorType: error.name
    };
  }
}

// Execute and handle result
createTestOrder().then(result => {
  if (result.success) {
    console.log('Successfully created test order with all related records');
    console.log('Order sent to ShipDay successfully');
  } else {
    console.error(`Failed to create test order (${result.errorType}):`, result.error);
    process.exit(1);
  }
}); 