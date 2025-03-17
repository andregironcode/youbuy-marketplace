
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationMap } from "@/components/map/LocationMap";
import { DeliveryRouteResponse } from "@/types/database.d";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightCircle, CalendarIcon, CheckCircle, Clock, Truck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Define the RouteStop type
type RouteStop = {
  id: string;
  type: "pickup" | "dropoff";
  orderId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: "pending" | "completed";
  scheduledTime: string;
  customerName: string;
  customerPhone: string;
};

// Define the DeliveryRoute type
type DeliveryRoute = {
  id: string;
  date: string;
  time_slot: "morning" | "afternoon" | "evening";
  pickup_route: RouteStop[];
  delivery_route: RouteStop[];
  status: string;
  created_at: string;
  updated_at: string | null;
};

export function DriverRoutes() {
  const { user } = useAuth();
  const [activeRoutes, setActiveRoutes] = useState<DeliveryRoute[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<DeliveryRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchDriverRoutes();
    }
  }, [user, dateFilter]);

  const fetchDriverRoutes = async () => {
    try {
      setIsLoading(true);
      
      // Call the stored function to get driver routes
      const { data, error } = await supabase
        .from('driver_routes')
        .select('*')
        .eq('driver_id', user?.id)
        .eq('date', dateFilter);
      
      if (error) throw error;
      
      // Transform the data to match the DeliveryRoute type
      const transformedRoutes: DeliveryRoute[] = data.map((route: any) => {
        return {
          ...route,
          pickup_route: Array.isArray(route.pickup_route) 
            ? route.pickup_route.map((stop: any) => ({
                ...stop,
                location: stop.location || { lat: 0, lng: 0, address: "" }
              }))
            : [],
          delivery_route: Array.isArray(route.delivery_route) 
            ? route.delivery_route.map((stop: any) => ({
                ...stop,
                location: stop.location || { lat: 0, lng: 0, address: "" }
              }))
            : [],
          time_slot: route.time_slot as "morning" | "afternoon" | "evening"
        };
      });
      
      // Filter active and completed routes
      const active = transformedRoutes.filter(route => 
        route.status !== 'completed' && route.status !== 'cancelled'
      );
      const completed = transformedRoutes.filter(route => 
        route.status === 'completed'
      );
      
      setActiveRoutes(active);
      setCompletedRoutes(completed);
      
      // Select the first active route by default if available
      if (active.length > 0 && !selectedRoute) {
        setSelectedRoute(active[0]);
      }
    } catch (error) {
      console.error("Error fetching driver routes:", error);
      toast({
        variant: "destructive",
        title: "Failed to load routes",
        description: "There was an error loading your assigned routes."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const markStopAsCompleted = async (stopId: string, routeId: string, stopType: "pickup" | "dropoff") => {
    try {
      if (!selectedRoute) return;
      
      // Call the API to update stop status
      const { data, error } = await supabase
        .from('route_stops')
        .update({ status: 'completed' })
        .eq('id', stopId)
        .eq('route_id', routeId)
        .eq('stop_type', stopType)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Stop completed",
        description: "The stop has been marked as completed."
      });
      
      // Refetch routes to update the UI
      await fetchDriverRoutes();
      
      // Update the selected route if it's the current one
      if (selectedRoute.id === routeId) {
        const updatedRoute = activeRoutes.find(r => r.id === routeId);
        if (updatedRoute) {
          setSelectedRoute(updatedRoute);
        }
      }
      
      // Clear selected stop if it was the one that was completed
      if (selectedStop && selectedStop.id === stopId) {
        setSelectedStop(null);
      }
    } catch (error) {
      console.error("Error updating stop status:", error);
      toast({
        variant: "destructive",
        title: "Failed to update stop",
        description: "There was an error marking the stop as completed."
      });
    }
  };

  const markRouteAsCompleted = async (routeId: string) => {
    try {
      // Call the API to update route status
      const { data, error } = await supabase
        .from('delivery_routes')
        .update({ status: 'completed' })
        .eq('id', routeId)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Route completed",
        description: "The route has been marked as completed."
      });
      
      // Refetch routes to update the UI
      await fetchDriverRoutes();
      
      // Clear selected route if it was the one that was completed
      if (selectedRoute && selectedRoute.id === routeId) {
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error("Error updating route status:", error);
      toast({
        variant: "destructive",
        title: "Failed to update route",
        description: "There was an error marking the route as completed."
      });
    }
  };

  const isRouteCompletable = (route: DeliveryRoute) => {
    const allPickupsCompleted = route.pickup_route.every(stop => stop.status === 'completed');
    const allDeliveriesCompleted = route.delivery_route.every(stop => stop.status === 'completed');
    return allPickupsCompleted && allDeliveriesCompleted;
  };

  const getTimeSlotLabel = (timeSlot: "morning" | "afternoon" | "evening") => {
    switch(timeSlot) {
      case "morning": return "Morning (9am - 12pm)";
      case "afternoon": return "Afternoon (12pm - 5pm)";
      case "evening": return "Evening (5pm - 9pm)";
      default: return timeSlot;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Delivery Routes</h1>
          <p className="text-muted-foreground">Manage your assigned routes for today</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              className="border rounded p-2 text-sm"
            />
          </div>
          <Button 
            variant="outline"
            onClick={fetchDriverRoutes}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
        <div className={`${isMobile ? 'col-span-1' : 'col-span-1'} space-y-4`}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading routes...</p>
              ) : activeRoutes.length === 0 ? (
                <p className="text-muted-foreground">No active routes for today.</p>
              ) : (
                <div className="space-y-2">
                  {activeRoutes.map(route => (
                    <div 
                      key={route.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedRoute?.id === route.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{new Date(route.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {getTimeSlotLabel(route.time_slot)}
                          </div>
                        </div>
                        <Badge variant={
                          route.status === 'in_progress' 
                            ? 'default' 
                            : route.status === 'pending' 
                              ? 'outline' 
                              : 'secondary'
                        }>
                          {route.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <span>{route.pickup_route.length} pickups</span>
                          <ArrowRightCircle className="h-3 w-3 mx-2" />
                          <span>{route.delivery_route.length} deliveries</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading routes...</p>
              ) : completedRoutes.length === 0 ? (
                <p className="text-muted-foreground">No completed routes.</p>
              ) : (
                <div className="space-y-2">
                  {completedRoutes.map(route => (
                    <div 
                      key={route.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedRoute?.id === route.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{new Date(route.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {getTimeSlotLabel(route.time_slot)}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          Completed
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <span>{route.pickup_route.length} pickups</span>
                          <ArrowRightCircle className="h-3 w-3 mx-2" />
                          <span>{route.delivery_route.length} deliveries</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
          {selectedRoute ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle>
                    Route Details - {new Date(selectedRoute.date).toLocaleDateString()}
                  </CardTitle>
                  {selectedRoute.status !== 'completed' && (
                    <Button
                      variant="default"
                      size={isMobile ? "default" : "default"}
                      onClick={() => markRouteAsCompleted(selectedRoute.id)}
                      disabled={!isRouteCompletable(selectedRoute)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isRouteCompletable(selectedRoute) 
                        ? "Complete Route" 
                        : "Complete All Stops First"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="map">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="map" className="flex-1">Map View</TabsTrigger>
                    <TabsTrigger value="pickups" className="flex-1">Pickups ({selectedRoute.pickup_route.length})</TabsTrigger>
                    <TabsTrigger value="deliveries" className="flex-1">Deliveries ({selectedRoute.delivery_route.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="map" className="space-y-4">
                    <div className="h-[300px] sm:h-[400px] md:h-[500px] relative rounded-md overflow-hidden border">
                      <LocationMap
                        latitude={selectedStop?.location.lat || selectedRoute.pickup_route[0]?.location.lat || 51.505}
                        longitude={selectedStop?.location.lng || selectedRoute.pickup_route[0]?.location.lng || -0.09}
                        zoom={12}
                        interactive={true}
                        showMarker={false}
                        className="w-full h-full"
                        height="100%"
                      />
                    </div>
                    
                    {selectedStop && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {selectedStop.type === 'pickup' ? 'Pickup from:' : 'Deliver to:'} {selectedStop.customerName}
                              </h3>
                              <p className="text-sm text-muted-foreground">{selectedStop.location.address}</p>
                              <p className="text-sm">{selectedStop.customerPhone}</p>
                              <p className="text-sm">Scheduled: {formatTime(selectedStop.scheduledTime)}</p>
                            </div>
                            {selectedRoute.status !== 'completed' && selectedStop.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => markStopAsCompleted(
                                  selectedStop.id, 
                                  selectedRoute.id, 
                                  selectedStop.type
                                )}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pickups">
                    <div className="space-y-2">
                      {selectedRoute.pickup_route.length === 0 ? (
                        <p className="text-muted-foreground">No pickups scheduled for this route.</p>
                      ) : (
                        selectedRoute.pickup_route.map(stop => (
                          <div 
                            key={stop.id}
                            className={`p-3 border rounded-md cursor-pointer ${
                              selectedStop?.id === stop.id 
                                ? 'bg-primary/10 border-primary' 
                                : stop.status === 'completed' 
                                  ? 'bg-green-50' 
                                  : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedStop(stop)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {stop.customerName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {stop.location.address}
                                </div>
                                <div className="text-sm">
                                  Scheduled: {formatTime(stop.scheduledTime)}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={stop.status === 'completed' ? 'default' : 'outline'}>
                                  {stop.status}
                                </Badge>
                                {selectedRoute.status !== 'completed' && stop.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markStopAsCompleted(stop.id, selectedRoute.id, 'pickup');
                                    }}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="deliveries">
                    <div className="space-y-2">
                      {selectedRoute.delivery_route.length === 0 ? (
                        <p className="text-muted-foreground">No deliveries scheduled for this route.</p>
                      ) : (
                        selectedRoute.delivery_route.map(stop => (
                          <div 
                            key={stop.id}
                            className={`p-3 border rounded-md cursor-pointer ${
                              selectedStop?.id === stop.id 
                                ? 'bg-primary/10 border-primary' 
                                : stop.status === 'completed' 
                                  ? 'bg-green-50' 
                                  : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedStop(stop)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {stop.customerName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {stop.location.address}
                                </div>
                                <div className="text-sm">
                                  Scheduled: {formatTime(stop.scheduledTime)}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={stop.status === 'completed' ? 'default' : 'outline'}>
                                  {stop.status}
                                </Badge>
                                {selectedRoute.status !== 'completed' && stop.status !== 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markStopAsCompleted(stop.id, selectedRoute.id, 'dropoff');
                                    }}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Truck className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Route Selected</h3>
                <p className="text-muted-foreground text-center">
                  Select a route from the list to view details and manage deliveries.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
