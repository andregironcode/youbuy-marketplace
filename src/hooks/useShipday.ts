
import { useState } from "react";
import { createShipdayOrder, formatOrderForShipday, ShipdayOrderDetails } from "@/utils/shipdayUtils";
import { useToast } from "@/hooks/use-toast";

export function useShipday() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { toast } = useToast();

  /**
   * Send an order to Shipday for delivery
   * @param order The order data to send to Shipday
   */
  const sendOrderToShipday = async (order: any) => {
    setIsCreatingOrder(true);
    
    try {
      // Format the order for Shipday
      const shipdayOrder = formatOrderForShipday(order);
      
      // Create the order in Shipday
      const result = await createShipdayOrder(shipdayOrder);
      
      toast({
        title: "Order sent to Shipday",
        description: "The delivery has been created successfully",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to send order to Shipday:", error);
      
      toast({
        title: "Failed to create delivery",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  /**
   * Test the Shipday integration by sending a test order
   */
  const sendTestOrder = async () => {
    const testOrder: ShipdayOrderDetails = {
      customerName: "Test Customer",
      customerAddress: "123 Test St, Test City, CA 12345",
      customerEmail: "test@example.com",
      customerPhoneNumber: "555-123-4567",
      
      orderNumber: `TEST-${Date.now()}`,
      orderSource: "YouBuy Test",
      
      deliveryAddress: "123 Test St, Test City, CA 12345",
      deliveryLatitude: 37.7749,
      deliveryLongitude: -122.4194,
      
      pickupAddress: "456 Seller St, Seller City, CA 54321",
      pickupLatitude: 37.8044,
      pickupLongitude: -122.2712,
      
      items: [
        { name: "Test Product 1", quantity: 1, price: 19.99 },
        { name: "Test Product 2", quantity: 2, price: 24.99 }
      ],
      
      totalPrice: 69.97,
      paymentMethod: "TEST",
      
      expectedDeliveryTime: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
    };
    
    return sendOrderToShipday(testOrder);
  };
  
  return {
    sendOrderToShipday,
    sendTestOrder,
    isCreatingOrder
  };
}
