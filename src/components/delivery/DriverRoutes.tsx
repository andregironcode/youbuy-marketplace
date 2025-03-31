
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, UserCircle, Map, Package, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define specific types to avoid recursive type issues
type DeliveryItem = {
  id: string;
  orderNumber?: string;
  address?: string;
  status?: string;
  customerName?: string;
  timeSlot?: string;
};

type DriverStatus = 'available' | 'busy' | 'offline';

export const DriverRoutes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isDriverRegistered, setIsDriverRegistered] = useState(false);
  const [driverProfile, setDriverProfile] = useState<{id: string, shipday_id?: string} | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('offline');
  
  useEffect(() => {
    if (user) {
      checkDriverProfile();
    }
  }, [user]);
  
  const checkDriverProfile = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      
      if (error) {
        console.error("Error fetching driver profile:", error);
        setIsDriverRegistered(false);
      } else if (data) {
        setDriverProfile(data);
        setIsDriverRegistered(true);
        fetchDeliveries();
        
        // Update driver status based on is_online field
        setDriverStatus(data.is_online ? 'available' : 'offline');
      } else {
        setIsDriverRegistered(false);
      }
    } catch (error) {
      console.error("Error checking driver profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      // In a real implementation, this would fetch deliveries from Shipday API
      // For now, using mock data
      const mockDeliveries: DeliveryItem[] = [
        {
          id: "del-1",
          orderNumber: "ORD-12345",
          address: "123 Main St, New York, NY",
          status: "assigned",
          customerName: "John Doe",
          timeSlot: "2-4 PM"
        },
        {
          id: "del-2",
          orderNumber: "ORD-12346",
          address: "456 Park Ave, New York, NY",
          status: "in_progress",
          customerName: "Jane Smith",
          timeSlot: "4-6 PM"
        }
      ];
      
      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast({
        title: "Failed to load deliveries",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const registerAsDriver = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase.functions.invoke("create-driver-account", {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      if (data?.shipdayAuthUrl) {
        window.location.href = data.shipdayAuthUrl;
      } else {
        toast({
          title: "Registration successful",
          description: "Your driver account has been created",
        });
        checkDriverProfile();
      }
    } catch (error) {
      console.error("Error registering as driver:", error);
      toast({
        title: "Registration failed",
        description: "Could not create your driver account",
        variant: "destructive"
      });
    }
  };

  const toggleDriverStatus = async () => {
    try {
      if (!driverProfile) return;
      
      const newStatus = driverStatus === 'offline' ? 'available' : 'offline';
      
      const { error } = await supabase
        .from("driver_profiles")
        .update({ is_online: newStatus === 'available' })
        .eq("id", driverProfile.id);
      
      if (error) throw error;
      
      setDriverStatus(newStatus);
      
      toast({
        title: `You are now ${newStatus}`,
        description: newStatus === 'available' 
          ? "You will receive delivery notifications" 
          : "You won't receive any new deliveries",
      });
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast({
        title: "Status update failed",
        description: "Could not update your availability",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isDriverRegistered) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Become a Driver</CardTitle>
            <CardDescription>
              Start delivering orders and earning money
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Register as a driver to start accepting delivery requests from sellers.
              You'll be able to choose your own schedule and delivery area.
            </p>
            <Button onClick={registerAsDriver} className="w-full sm:w-auto">
              Register as Driver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries and availability</p>
        </div>
        <Button 
          onClick={toggleDriverStatus}
          variant={driverStatus === 'offline' ? 'outline' : 'default'}
          className={`gap-2 ${driverStatus === 'available' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          <UserCircle className="h-4 w-4" />
          {driverStatus === 'offline' ? 'Go Online' : 'Go Offline'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{deliveries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`font-medium flex items-center gap-1.5 ${
              driverStatus === 'available' ? 'text-green-600' : 
              driverStatus === 'busy' ? 'text-orange-500' : 'text-gray-500'
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${
                driverStatus === 'available' ? 'bg-green-600' : 
                driverStatus === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
              }`}></span>
              {driverStatus === 'available' ? 'Available' : 
               driverStatus === 'busy' ? 'On Delivery' : 'Offline'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earnings Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0.00</div>
          </CardContent>
        </Card>
      </div>
      
      {driverStatus === 'offline' ? (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">You're currently offline</h3>
                <p className="text-amber-700 text-sm">
                  Go online to start receiving delivery requests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : deliveries.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Deliveries</h2>
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="overflow-hidden">
              <div className="border-l-4 border-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium mb-2">Order #{delivery.orderNumber}</h3>
                    <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                      delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      delivery.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {delivery.status === 'assigned' ? 'Assigned' :
                       delivery.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Package className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{delivery.customerName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Map className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{delivery.address}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{delivery.timeSlot}</span>
                      </div>
                      <div className="flex justify-end gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Map className="h-3.5 w-3.5" />
                          Directions
                        </Button>
                        <Button size="sm">Start Delivery</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No Deliveries</h3>
            <p className="text-muted-foreground">
              You don't have any deliveries assigned yet.
              Check back later or contact support if you think this is an error.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
