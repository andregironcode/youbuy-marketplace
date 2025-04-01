import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Shipday } from 'shipday/integration';

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

// Initialize Shipday client
const shipdayClient = new Shipday(process.env.SHIPDAY_API_KEY);

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

// Send order to ShipDay using SDK
async function sendOrderToShipDay(order) {
  try {
    // Validate required fields
    if (!order.orderNumber || !order.customerName || !order.customerAddress) {
      throw new ValidationError('Missing required fields for ShipDay order');
    }

    // Create order using SDK
    const response = await shipdayClient.createOrder({
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryWindow,
      customerName: order.customer.name,
      customerAddress: order.customer.address.street,
      customerEmail: order.customer.email || '',
      customerPhoneNumber: order.customer.phone,
      restaurantName: order.pickup.name,
      restaurantAddress: order.pickup.address.street,
      restaurantPhoneNumber: order.pickup.phone,
      pickupLatitude: order.pickup.address.latitude,
      pickupLongitude: order.pickup.address.longitude,
      deliveryLatitude: order.customer.address.latitude,
      deliveryLongitude: order.customer.address.longitude,
      orderAmount: order.amount || 0,
      tip: 0,
      tax: 0,
      deliveryFee: order.deliveryFee || 0,
      totalAmount: (order.amount || 0) + (order.deliveryFee || 0),
      pickupInstruction: order.pickup.instructions || '',
      deliveryInstruction: order.delivery.instructions || '',
      orderSource: 'YouBuy Marketplace',
      additionalId: order.additionalId || '',
      items: order.items || [],
      status: order.status || 'ORDERED'
    });

    return response;
  } catch (error) {
    console.error('ShipDay SDK Error:', error);
    throw new ShipDayError('Failed to send order to ShipDay', error);
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
    customerName: deliveryDetails.contact_name,
    customerAddress: deliveryDetails.delivery_address,
    customerPhoneNumber: deliveryDetails.contact_phone,
    customerEmail: '',
    restaurantName: seller.full_name || seller.username || 'Seller',
    restaurantAddress: deliveryDetails.pickup_address,
    restaurantPhoneNumber: seller.phone || deliveryDetails.contact_phone,
    pickupLatitude: deliveryDetails.pickup_coordinates[0],
    pickupLongitude: deliveryDetails.pickup_coordinates[1],
    deliveryLatitude: deliveryDetails.delivery_coordinates[0],
    deliveryLongitude: deliveryDetails.delivery_coordinates[1],
    orderAmount: order.amount,
    deliveryFee: deliveryDetails.delivery_cost,
    totalAmount: order.amount + deliveryDetails.delivery_cost,
    pickupInstruction: deliveryDetails.delivery_instructions || 'Please call upon arrival',
    deliveryInstruction: deliveryDetails.delivery_instructions || 'Please call upon arrival',
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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