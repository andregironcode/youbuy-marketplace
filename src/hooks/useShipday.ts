
import { useState } from "react";
import { createShipdayOrder, formatOrderForShipday } from "@/utils/shipdayUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useShipday() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  /**
   * Test the connection to the Shipday edge function
   */
  const testShipdayConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Make a simple GET request to the edge function
      const { data, error } = await supabase.functions.invoke("shipday-integration", {
        method: "GET"
      });
      
      if (error) {
        console.error("Error testing Shipday connection:", error);
        toast({
          title: "Connection test failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Shipday connection test successful:", data);
      
      toast({
        title: "Connection test successful",
        description: "Successfully connected to Shipday integration",
      });
      
      return true;
    } catch (error) {
      console.error("Exception testing Shipday connection:", error);
      
      toast({
        title: "Connection test failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  /**
   * Send an order to Shipday for delivery
   * @param order The order data to send to Shipday
   */
  const sendOrderToShipday = async (order: any) => {
    setIsCreatingOrder(true);
    
    try {
      console.log("Original order data:", order);
      
      // Format the order for Shipday
      const shipdayOrder = formatOrderForShipday(order);
      console.log("Formatted Shipday order:", shipdayOrder);
      
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
    // Create a test order with realistic data
    const testOrder = {
      buyer: {
        firstName: "Test",
        lastName: "Customer",
        email: "test@example.com",
        phone: "555-123-4567",
        address: "123 Test St, Test City, CA 12345",
        latitude: 37.7749,
        longitude: -122.4194
      },
      seller: {
        name: "Test Seller",
        address: "456 Seller St, Seller City, CA 54321",
        latitude: 37.8044,
        longitude: -122.2712
      },
      id: `TEST-${Date.now()}`,
      items: [
        { title: "Test Product 1", quantity: 1, price: 19.99 },
        { title: "Test Product 2", quantity: 2, price: 24.99 }
      ],
      totalAmount: 69.97,
      paymentMethod: "TEST",
      delivery_details: {
        fullName: "Test Customer",
        formattedAddress: "123 Test St, Test City, CA 12345",
        phone: "555-123-4567",
        deliveryTime: "afternoon",
        latitude: 37.7749,
        longitude: -122.4194
      }
    };
    
    console.log("Sending test order:", testOrder);
    return sendOrderToShipday(testOrder);
  };
  
  return {
    sendOrderToShipday,
    sendTestOrder,
    testShipdayConnection,
    isCreatingOrder,
    isTestingConnection
  };
}
