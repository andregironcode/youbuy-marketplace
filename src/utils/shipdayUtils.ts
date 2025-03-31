
import { supabase } from "@/integrations/supabase/client";

interface ShipdayOrderItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface ShipdayOrderDetails {
  // Customer details
  customerName: string;
  customerAddress: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  
  // Order details
  orderNumber: string;
  orderSource?: string;
  
  // Pickup details
  pickupAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  
  // Delivery details
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  
  // Order items
  items?: ShipdayOrderItem[];
  
  // Payment details
  totalPrice?: number;
  tipAmount?: number;
  paymentMethod?: string;
  
  // Other details
  expectedDeliveryTime?: string; // ISO date format
  expectedPickupTime?: string;   // ISO date format
}

/**
 * Create a new delivery order in Shipday
 * @param orderDetails The order details to send to Shipday
 * @returns Response from the Shipday API
 */
export async function createShipdayOrder(orderDetails: ShipdayOrderDetails) {
  try {
    console.log("Creating Shipday order with details:", JSON.stringify(orderDetails, null, 2));
    
    // Format the order according to Shipday API requirements
    // https://docs.shipday.com/reference/create-order
    const shipdayPayload = {
      // Required fields
      orderNumber: orderDetails.orderNumber,
      customerName: orderDetails.customerName,
      customerAddress: orderDetails.deliveryAddress, // Use delivery address as customer address
      
      // Optional fields
      customerEmail: orderDetails.customerEmail,
      customerPhoneNumber: orderDetails.customerPhoneNumber,
      restaurantName: "YouBuy Marketplace", // Using this as the pickup point name
      pickupAddress: orderDetails.pickupAddress,
      deliveryAddress: orderDetails.deliveryAddress,
      expectedPickupTime: orderDetails.expectedPickupTime,
      expectedDeliveryTime: orderDetails.expectedDeliveryTime,
      orderSource: orderDetails.orderSource || "YouBuy Marketplace",
      paymentMethod: orderDetails.paymentMethod,
      totalPrice: orderDetails.totalPrice,
      tip: orderDetails.tipAmount,
      
      // Optional location data
      pickupLatitude: orderDetails.pickupLatitude,
      pickupLongitude: orderDetails.pickupLongitude,
      deliveryLatitude: orderDetails.deliveryLatitude,
      deliveryLongitude: orderDetails.deliveryLongitude,
      
      // Order items
      items: orderDetails.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    // Send the order to Shipday
    const { data, error } = await supabase.functions.invoke("shipday-integration/create-order", {
      method: "POST",
      body: shipdayPayload
    });
    
    if (error) {
      console.error("Error creating Shipday order:", error);
      throw new Error(`Failed to create Shipday order: ${error.message}`);
    }
    
    console.log("Shipday order created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createShipdayOrder:", error);
    throw error;
  }
}

/**
 * Format an order for Shipday based on the marketplace order data
 * @param order The order data from the marketplace
 * @returns Formatted order data for Shipday
 */
export function formatOrderForShipday(order: any): ShipdayOrderDetails {
  // Extract buyer information
  const buyer = order.buyer || {};
  const deliveryDetails = order.delivery_details || {};
  
  // Extract seller information
  const seller = order.seller || {};
  
  // Format items
  const items = order.items?.map((item: any) => ({
    name: item.title || item.name || "Product",
    quantity: item.quantity || 1,
    price: item.price || 0
  })) || [];
  
  // Calculate total price
  const totalPrice = order.totalAmount || order.amount || items.reduce((total: number, item: any) => {
    return total + (item.price || 0) * (item.quantity || 1);
  }, 0);
  
  // Format delivery address
  let deliveryAddress = '';
  if (deliveryDetails.formattedAddress) {
    deliveryAddress = deliveryDetails.formattedAddress;
  } else {
    deliveryAddress = buyer.address || 
      `${buyer.street || ""}, ${buyer.city || ""}, ${buyer.state || ""} ${buyer.zipCode || ""}`;
  }
  
  // Format pickup address
  const pickupAddress = seller.address || 
    `${seller.street || ""}, ${seller.city || ""}, ${seller.state || ""} ${seller.zipCode || ""}`;
  
  // Format customer name
  const customerName = deliveryDetails.fullName || buyer.name || `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim();
  
  // Get delivery time preference
  let expectedDeliveryTime = null;
  if (deliveryDetails.deliveryTime) {
    // Convert delivery preference to an actual time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (deliveryDetails.deliveryTime === 'morning') {
      // Set to tomorrow at 10:00 AM
      tomorrow.setHours(10, 0, 0, 0);
      expectedDeliveryTime = tomorrow.toISOString();
    } else if (deliveryDetails.deliveryTime === 'afternoon') {
      // Set to tomorrow at 2:00 PM
      tomorrow.setHours(14, 0, 0, 0);
      expectedDeliveryTime = tomorrow.toISOString();
    } else if (deliveryDetails.deliveryTime === 'evening') {
      // Set to tomorrow at 7:00 PM
      tomorrow.setHours(19, 0, 0, 0);
      expectedDeliveryTime = tomorrow.toISOString();
    }
  }
  
  // Return formatted order
  return {
    customerName: customerName,
    customerAddress: deliveryAddress,
    customerEmail: buyer.email || deliveryDetails.email,
    customerPhoneNumber: buyer.phone || deliveryDetails.phone,
    
    orderNumber: order.id || order.orderId || `ORD-${Date.now()}`,
    orderSource: "YouBuy Marketplace",
    
    deliveryAddress: deliveryAddress,
    deliveryLatitude: deliveryDetails.latitude || buyer.latitude,
    deliveryLongitude: deliveryDetails.longitude || buyer.longitude,
    
    pickupAddress: pickupAddress,
    pickupLatitude: seller.latitude,
    pickupLongitude: seller.longitude,
    
    items: items,
    totalPrice: totalPrice,
    paymentMethod: order.paymentMethod || "Credit Card",
    
    expectedDeliveryTime: expectedDeliveryTime || order.expectedDeliveryTime,
    expectedPickupTime: order.expectedPickupTime
  };
}
