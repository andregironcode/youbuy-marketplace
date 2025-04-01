import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
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
          date: deliveryDate,
          time_slot: timeSlot,
          status: 'pending',
          pickup_route: {
            address: pickupAddress,
            coordinates: [pickupLat, pickupLng],
            contact_name: 'Seller Name',
            contact_phone: sellerPhone,
            pickup_instructions: 'Ring doorbell twice',
            estimated_pickup_time: '9:00 AM'
          },
          delivery_route: {
            address: deliveryAddress,
            coordinates: [deliveryLat, deliveryLng],
            contact_name: 'Test Customer',
            contact_phone: customerPhone,
            delivery_instructions: 'Please call upon arrival',
            estimated_delivery_time: '10:30 AM'
          }
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

    return {
      success: true,
      order: order[0],
      route: route[0],
      history: history[0]
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
  } else {
    console.error(`Failed to create test order (${result.errorType}):`, result.error);
    process.exit(1);
  }
}); 