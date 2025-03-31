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
  restaurantName?: string;
  deliveryInstruction?: string;
  
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
    console.log("Creating Shipday order:", orderDetails);
    
    const { data, error } = await supabase.functions.invoke("shipday-integration/create-order", {
      method: "POST",
      body: orderDetails
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
  
  // Extract seller information
  const seller = order.seller || {};
  
  // Format items
  const items = order.items?.map((item: any) => ({
    name: item.title || item.name || "Product",
    quantity: item.quantity || 1,
    price: item.price || 0
  })) || [];
  
  // Calculate total price
  const totalPrice = order.totalAmount || items.reduce((total: number, item: any) => {
    return total + (item.price || 0) * (item.quantity || 1);
  }, 0);
  
  // Format delivery address
  const deliveryAddress = buyer.address || 
    `${buyer.street || ""}, ${buyer.city || ""}, ${buyer.state || ""} ${buyer.zipCode || ""}`;
  
  // Format pickup address
  const pickupAddress = seller.address || 
    `${seller.street || ""}, ${seller.city || ""}, ${seller.state || ""} ${seller.zipCode || ""}`;
  
  // Return formatted order
  return {
    customerName: buyer.name || `${buyer.firstName || ""} ${buyer.lastName || ""}`,
    customerAddress: deliveryAddress,
    customerEmail: buyer.email,
    customerPhoneNumber: buyer.phone,
    
    orderNumber: order.id || order.orderId || `ORD-${Date.now()}`,
    orderSource: "YouBuy Marketplace",
    
    deliveryAddress: deliveryAddress,
    deliveryLatitude: buyer.latitude,
    deliveryLongitude: buyer.longitude,
    
    pickupAddress: pickupAddress,
    pickupLatitude: seller.latitude,
    pickupLongitude: seller.longitude,
    
    items: items,
    totalPrice: totalPrice,
    paymentMethod: order.paymentMethod || "Credit Card",
    
    expectedDeliveryTime: order.expectedDeliveryTime,
    expectedPickupTime: order.expectedPickupTime
  };
}
