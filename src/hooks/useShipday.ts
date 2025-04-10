
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
      console.log("Testing Shipday connection...");
      // Make a simple GET request to the edge function
      const { data, error } = await supabase.functions.invoke("shipday-integration", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Shipday connection test response:", data, error);
      
      if (error) {
        console.error("Error testing Shipday edge function:", error);
        toast({
          title: "Connection test failed",
          description: `Failed to connect to Shipday: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check if data contains an error message
      if (data && data.error) {
        console.error("Shipday connection test failed:", data);
        
        // Extract helpful information from the response
        let errorDescription = data.error;
        if (data.note) {
          errorDescription += `: ${data.note}`;
        } else if (data.message) {
          errorDescription += `: ${data.message}`;
        }
        
        // If we have key format issues, display them
        if (data.keyInfo) {
          const keyInfo = data.keyInfo;
          errorDescription += `\n\nAPI Key Info: ${keyInfo.length} chars, starts with ${keyInfo.startsWithFourChars}`;
          if (keyInfo.containsSpaces) {
            errorDescription += ", contains spaces (remove them)";
          }
          if (keyInfo.containsQuotes) {
            errorDescription += ", contains quotes (remove them)";
          }
        }
        
        toast({
          title: "Connection test failed",
          description: errorDescription,
          variant: "destructive",
        });
        return false;
      }
      
      if (!data || !data.success) {
        console.error("Shipday connection test failed with unexpected response:", data);
        toast({
          title: "Connection test failed",
          description: data?.message || "Unexpected response from Shipday integration",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Shipday connection test successful:", data);
      
      toast({
        title: "Connection test successful",
        description: data.message || "Successfully connected to Shipday integration",
      });
      
      return true;
    } catch (error) {
      console.error("Exception testing Shipday edge function:", error);
      
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
      // First test if connection is working
      const connectionWorks = await testShipdayConnection();
      if (!connectionWorks) {
        toast({
          title: "Aborting order creation",
          description: "Cannot create order because connection to Shipday failed",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Original order data:", order);
      
      // Format the order for Shipday
      const shipdayOrder = formatOrderForShipday(order);
      console.log("Formatted Shipday order:", shipdayOrder);
      
      // Create the order in Shipday
      const { data, error } = await supabase.functions.invoke("shipday-integration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: shipdayOrder
      });
      
      if (error) {
        console.error("Error in sendOrderToShipday:", error);
        throw new Error(`Failed to connect to Shipday edge function: ${error.message}`);
      }
      
      if (data && data.error) {
        console.error("Failed to create Shipday order:", data);
        throw new Error(`Failed to create Shipday order: ${data.error}`);
      }
      
      if (!data || !data.success) {
        console.error("Unexpected response creating Shipday order:", data);
        throw new Error(`Failed to create Shipday order: ${data?.message || "Unexpected response"}`);
      }
      
      toast({
        title: "Order sent to Shipday",
        description: "The delivery has been created successfully",
      });
      
      return data;
    } catch (error) {
      console.error("Error in sendOrderToShipday:", error);
      
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
    try {
      // First test if connection is working
      const connectionWorks = await testShipdayConnection();
      if (!connectionWorks) {
        console.log("Aborting test order as connection is not working");
        return null;
      }
      
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
    } catch (error) {
      console.error("Test order creation failed:", error);
      toast({
        title: "Failed to create test delivery",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      return null;
    }
  };
  
  return {
    sendOrderToShipday,
    sendTestOrder,
    testShipdayConnection,
    isCreatingOrder,
    isTestingConnection
  };
}
