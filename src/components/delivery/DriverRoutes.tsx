import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button-extended";
import { 
  MapPin, 
  CheckCircle, 
  Truck, 
  Calendar, 
  Clock, 
  Package, 
  AlertCircle, 
  ArrowRight 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/locationUtils";

interface RouteStop {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  order_id: string;
  product_id: string;
  product_title: string;
  customer_name: string;
  notes?: string;
  completed_at?: string;
}

interface DeliveryRoute {
  id: string;
  date: string;
  time_slot: string;
  status: string;
  created_at: string;
  updated_at: string;
  pickup_route: RouteStop[];
  delivery_route: RouteStop[];
}

export const DriverRoutes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todayRoutes, setTodayRoutes] = useState<DeliveryRoute[]>([]);
  const [upcomingRoutes, setUpcomingRoutes] = useState<DeliveryRoute[]>([]);
  const [pastRoutes, setPastRoutes] = useState<DeliveryRoute[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to access your location. Some features might be limited.",
            variant: "destructive"
          });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRoutes();
    }
  }, [user]);

  const fetchRoutes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch all routes for this driver
      const { data, error } = await supabase
        .from("delivery_routes")
        .select("*")
        .eq("driver_id", user.id)
        .order("date", { ascending: true })
        .order("time_slot", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Process and categorize routes
      if (data) {
        const today = new Date().toISOString().split("T")[0];
        
        const todayData: DeliveryRoute[] = [];
        const upcomingData: DeliveryRoute[] = [];
        const pastData: DeliveryRoute[] = [];
        
        data.forEach((route: any) => {
          // Parse JSON fields
          const parsedRoute = {
            ...route,
            pickup_route: typeof route.pickup_route === 'string' 
              ? JSON.parse(route.pickup_route) 
              : route.pickup_route,
            delivery_route: typeof route.delivery_route === 'string' 
              ? JSON.parse(route.delivery_route) 
              : route.delivery_route
          };
          
          if (route.date === today) {
            todayData.push(parsedRoute);
          } else if (route.date > today) {
            upcomingData.push(parsedRoute);
          } else {
            pastData.push(parsedRoute);
          }
        });
        
        setTodayRoutes(todayData);
        setUpcomingRoutes(upcomingData);
        setPastRoutes(pastData);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast({
        title: "Error",
        description: "Failed to load delivery routes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStopStatus = async (routeId: string, stopId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      // Find the route and stop
      const routeIndex = todayRoutes.findIndex(route => route.id === routeId);
      if (routeIndex === -1) return;
      
      const route = {...todayRoutes[routeIndex]};
      
      // Check if the stop is in pickup or delivery route
      let isPickup = false;
      let stopIndex = route.pickup_route.findIndex(stop => stop.id === stopId);
      
      if (stopIndex === -1) {
        stopIndex = route.delivery_route.findIndex(stop => stop.id === stopId);
        if (stopIndex === -1) return;
      } else {
        isPickup = true;
      }
      
      // Update the stop status
      if (isPickup) {
        route.pickup_route[stopIndex].status = newStatus;
        route.pickup_route[stopIndex].completed_at = new Date().toISOString();
      } else {
        route.delivery_route[stopIndex].status = newStatus;
        route.delivery_route[stopIndex].completed_at = new Date().toISOString();
      }
      
      // Update the UI first for responsiveness
      const updatedRoutes = [...todayRoutes];
      updatedRoutes[routeIndex] = route;
      setTodayRoutes(updatedRoutes);
      
      // Now update the database
      const { error } = await supabase
        .from("delivery_routes")
        .update({
          pickup_route: JSON.stringify(route.pickup_route),
          delivery_route: JSON.stringify(route.delivery_route),
          updated_at: new Date().toISOString()
        })
        .eq("id", routeId);
      
      if (error) throw error;
      
      // Also update the order status in the database if needed
      if (newStatus === "completed") {
        const orderId = isPickup 
          ? route.pickup_route[stopIndex].order_id 
          : route.delivery_route[stopIndex].order_id;
        
        const newOrderStatus = isPickup ? "picked_up" : "delivered";
        
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: newOrderStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);
        
        if (orderError) throw orderError;
      }
      
      toast({
        title: "Success",
        description: `Stop marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating stop status:", error);
      toast({
        title: "Error",
        description: "Failed to update stop status. Please try again.",
        variant: "destructive"
      });
      
      // Revert UI changes
      fetchRoutes();
    }
  };

  const updateRouteStatus = async (routeId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      // Find the route
      const routeIndex = todayRoutes.findIndex(route => route.id === routeId);
      if (routeIndex === -1) return;
      
      // Update the route status in UI first
      const updatedRoutes = [...todayRoutes];
      updatedRoutes[routeIndex] = {
        ...updatedRoutes[routeIndex],
        status: newStatus
      };
      setTodayRoutes(updatedRoutes);
      
      // Now update the database
      const { error } = await supabase
        .from("delivery_routes")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", routeId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Route marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating route status:", error);
      toast({
        title: "Error",
        description: "Failed to update route status. Please try again.",
        variant: "destructive"
      });
      
      // Revert UI changes
      fetchRoutes();
    }
  };

  const getStopDistance = (stop: RouteStop) => {
    if (!userLocation || !stop.latitude || !stop.longitude) return null;
    
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      stop.latitude,
      stop.longitude
    );
  };

  const formatDistance = (distance: number | null) => {
    if (distance === null) return "Unknown";
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    
    return `${distance.toFixed(1)} km`;
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "pending":
        return "outline";
      case "in_progress":
        return "secondary";
      case "completed":
        return "default"; // Using default instead of success
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderRouteCard = (route: DeliveryRoute) => {
    return (
      <Card key={route.id} className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                {new Date(route.date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {route.time_slot}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(route.status)}>
              {route.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {route.pickup_route && route.pickup_route.length > 0 && (
              <div>
                <h3 className="font-medium flex items-center mb-2">
                  <Package className="mr-2 h-4 w-4 text-blue-500" />
                  Pickups ({route.pickup_route.length})
                </h3>
                <div className="space-y-3 ml-6">
                  {route.pickup_route.map((stop) => (
                    <div key={stop.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{stop.product_title}</p>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {stop.address}
                          </p>
                          {userLocation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Distance: {formatDistance(getStopDistance(stop))}
                            </p>
                          )}
                        </div>
                        <Badge variant={getStatusBadgeVariant(stop.status)}>
                          {stop.status.replace("_", " ")}
                        </Badge>
                      </div>
                      
                      {route.status === "in_progress" && stop.status !== "completed" && (
                        <div className="mt-3 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
                              window.open(mapsUrl, "_blank");
                            }}
                          >
                            Navigate
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateStopStatus(route.id, stop.id, "completed")}
                          >
                            Mark Picked Up
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {route.delivery_route && route.delivery_route.length > 0 && (
              <div>
                <h3 className="font-medium flex items-center mb-2">
                  <Truck className="mr-2 h-4 w-4 text-green-500" />
                  Deliveries ({route.delivery_route.length})
                </h3>
                <div className="space-y-3 ml-6">
                  {route.delivery_route.map((stop) => (
                    <div key={stop.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{stop.product_title}</p>
                          <p className="text-sm flex items-center mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {stop.address}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            For: {stop.customer_name}
                          </p>
                          {userLocation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Distance: {formatDistance(getStopDistance(stop))}
                            </p>
                          )}
                        </div>
                        <Badge variant={getStatusBadgeVariant(stop.status)}>
                          {stop.status.replace("_", " ")}
                        </Badge>
                      </div>
                      
                      {route.status === "in_progress" && stop.status !== "completed" && (
                        <div className="mt-3 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
                              window.open(mapsUrl, "_blank");
                            }}
                          >
                            Navigate
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateStopStatus(route.id, stop.id, "completed")}
                          >
                            Mark Delivered
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        {route.status === "pending" && (
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => updateRouteStatus(route.id, "in_progress")}
            >
              Start Route
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
        
        {route.status === "in_progress" && (
          <CardFooter>
            <Button 
              variant="default"
              className="w-full" 
              onClick={() => updateRouteStatus(route.id, "completed")}
            >
              Complete Route
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Delivery Routes</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="today">
            Today
            {todayRoutes.length > 0 && (
              <Badge className="ml-2">{todayRoutes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingRoutes.length > 0 && (
              <Badge className="ml-2">{upcomingRoutes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            {pastRoutes.length > 0 && (
              <Badge className="ml-2">{pastRoutes.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          {todayRoutes.length > 0 ? (
            todayRoutes.map(renderRouteCard)
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No routes scheduled for today</p>
                <p className="text-muted-foreground mt-2">
                  Check back later or view upcoming deliveries
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {upcomingRoutes.length > 0 ? (
            upcomingRoutes.map(renderRouteCard)
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No upcoming routes</p>
                <p className="text-muted-foreground mt-2">
                  You don't have any future deliveries scheduled
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastRoutes.length > 0 ? (
            pastRoutes.map(renderRouteCard)
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No past routes</p>
                <p className="text-muted-foreground mt-2">
                  Your delivery history will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
