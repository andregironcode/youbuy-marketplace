import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SHIPDAY_API_KEY'
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ShipDay API configuration
const shipdayConfig = {
  apiKey: process.env.SHIPDAY_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SHIPDAY_API_KEY}`
  }
};

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

// Send order to ShipDay API
async function sendOrderToShipDay(order) {
  try {
    // ShipDay's API endpoint
    const response = await axios.post(
      'https://api.shipday.com/api/v1/orders',
      order,
      { 
        headers: shipdayConfig.headers,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Accept any 2xx status code
        }
      }
    );

    if (!response.data || !response.data.order_id) {
      throw new ShipDayError('Invalid response from ShipDay API', response.data);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('ShipDay API Error Response:', error.response.data);
      throw new ShipDayError(
        `ShipDay API error: ${error.response.data.message || error.message}`,
        error.response.data
      );
    }
    throw new ShipDayError('Failed to send order to ShipDay', error);
  }
}

// Format order for ShipDay API
async function formatOrderForShipDay(order, route) {
  const deliveryDetails = order.delivery_details;
  const pickupRoute = route.pickup_route;
  const deliveryRoute = route.delivery_route;

  // Fetch seller information
  const { data: seller, error: sellerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', order.seller_id)
    .single();

  if (sellerError) {
    throw new DatabaseError('Failed to fetch seller information', sellerError);
  }

  // Convert time slot to ShipDay time window
  const timeSlotToWindow = {
    'morning': '09:00-12:00',
    'afternoon': '13:00-16:00',
    'evening': '17:00-20:00'
  };

  // Format the order according to ShipDay's API requirements
  return {
    order_number: order.id,
    order_date: new Date(order.created_at).toISOString(),
    delivery_date: route.date,
    delivery_window: timeSlotToWindow[route.time_slot] || '09:00-17:00',
    status: 'pending',
    customer: {
      name: deliveryDetails.contact_name,
      phone: deliveryDetails.contact_phone,
      email: '', // We might want to add this to our schema
      address: {
        street: deliveryDetails.delivery_address,
        city: 'Dubai', // We might want to add this to our schema
        state: 'Dubai', // We might want to add this to our schema
        country: 'UAE',
        postal_code: '', // We might want to add this to our schema
        latitude: deliveryDetails.delivery_coordinates[0],
        longitude: deliveryDetails.delivery_coordinates[1]
      }
    },
    pickup: {
      name: seller.full_name || seller.username || 'Seller', // Use seller's full name or username
      phone: seller.phone || pickupRoute.contact_phone, // Use seller's phone if available
      address: {
        street: pickupRoute.address,
        city: 'Dubai', // We might want to add this to our schema
        state: 'Dubai', // We might want to add this to our schema
        country: 'UAE',
        postal_code: '', // We might want to add this to our schema
        latitude: pickupRoute.coordinates[0],
        longitude: pickupRoute.coordinates[1]
      },
      instructions: pickupRoute.pickup_instructions,
      window: timeSlotToWindow[route.time_slot] || '09:00-17:00'
    },
    delivery: {
      instructions: deliveryDetails.delivery_instructions,
      signature_required: true,
      proof_of_delivery: true
    },
    items: [
      {
        name: 'Package',
        quantity: 1,
        weight: deliveryDetails.package_weight,
        dimensions: deliveryDetails.package_dimensions
      }
    ],
    notes: `Order ID: ${order.id}\nProduct ID: ${order.product_id}\nDelivery Cost: ${deliveryDetails.delivery_cost}`
  };
}

// Validation functions
function validateCoordinates(lat, lng) {
  if (!lat || !lng) {
    throw new ValidationError('Coordinates are required');
  }
  if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) {
    throw new ValidationError('Invalid coordinates: must be within valid ranges');
  }
  return true;
}

function validateTimeSlot(timeSlot) {
  const validTimeSlots = ['morning', 'afternoon', 'evening'];
  if (!validTimeSlots.includes(timeSlot)) {
    throw new ValidationError(`Invalid time slot: must be one of ${validTimeSlots.join(', ')}`);
  }
  return true;
}

function validateAddress(address) {
  if (!address || address.length < 5) {
    throw new ValidationError('Invalid address: must be at least 5 characters');
  }
  return true;
}

function validatePhoneNumber(phone) {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number: must be in E.164 format (e.g., +971501234567)');
  }
  return true;
}

async function checkRouteOverlap(date, timeSlot) {
  try {
    const { data: existingRoutes, error } = await supabase
      .from('delivery_routes')
      .select('*')
      .eq('date', date)
      .eq('time_slot', timeSlot);
    
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
    const pickupAddress = '123 Pickup St, Dubai, UAE';
    const deliveryAddress = '456 Delivery Ave, Dubai, UAE';
    const pickupLat = 25.2048;
    const pickupLng = 55.2708;
    const deliveryLat = 25.1972;
    const deliveryLng = 55.2744;
    const timeSlot = 'morning';
    const deliveryDate = new Date().toISOString().split('T')[0];
    const customerPhone = '+971501234567';
    const sellerPhone = '+971509876543';

    // Validate all input data
    validateCoordinates(pickupLat, pickupLng);
    validateCoordinates(deliveryLat, deliveryLng);
    validateTimeSlot(timeSlot);
    validateAddress(pickupAddress);
    validateAddress(deliveryAddress);
    validatePhoneNumber(customerPhone);
    validatePhoneNumber(sellerPhone);

    // Check for route overlaps
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
          delivery_details: {
            pickup_address: pickupAddress,
            delivery_address: deliveryAddress,
            pickup_coordinates: [pickupLat, pickupLng],
            delivery_coordinates: [deliveryLat, deliveryLng],
            contact_name: 'Test Customer',
            contact_phone: customerPhone,
            delivery_instructions: 'Please call upon arrival',
            package_weight: '2.5kg',
            package_dimensions: '30x20x15cm',
            delivery_cost: 25.00,
            preferred_delivery_window: '9:00 AM - 12:00 PM'
          },
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
          pickup_address: pickupAddress,
          delivery_address: deliveryAddress,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          delivery_lat: deliveryLat,
          delivery_lng: deliveryLng,
          status: 'pending',
          scheduled_time: new Date(`${deliveryDate}T09:00:00Z`).toISOString(),
          customer_name: 'Test Customer',
          customer_phone: customerPhone
        }
      ])
      .select();

    if (routeError) {
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
          location_lat: pickupLat,
          location_lng: pickupLng,
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

    // Update order with ShipDay reference
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