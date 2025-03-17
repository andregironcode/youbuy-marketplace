
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackingUpdate } from "@/components/sales/TrackingUpdate";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  Package,
  Truck,
  User,
  Calendar,
  Navigation,
  RefreshCw,
  Clock,
  CheckCircle,
  Route,
} from "lucide-react";

type RouteStop = {
  id: string;
  type: 'pickup' | 'delivery';
  orderId: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  personName: string;
  productTitle: string;
  preferredTime: string | null;
  completed?: boolean;
};

export const DriverRoutes = () => {
  const [currentDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon'>(
    new Date().getHours() < 13 ? 'morning' : 'afternoon'
  );
  const [routeType, setRouteType] = useState<'pickups' | 'deliveries'>('pickups');
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchOptimizedRoutes = async () => {
    setIsLoading(true);
    try {
      // Format the date for the query
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      // Fetch the latest optimized route for the current date and time slot
      const { data: routes, error } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('date', formattedDate)
        .eq('time_slot', timeSlot)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No routes found
          toast({
            title: "No routes available",
            description: `No routes found for ${format(currentDate, 'MMMM d, yyyy')} (${timeSlot} shift)`,
            variant: "destructive"
          });
          setStops([]);
        } else {
          throw error;
        }
      } else if (routes) {
        console.log("Fetched optimized routes:", routes);
        
        // Extract the appropriate route based on the selected type
        const routeData = routeType === 'pickups' 
          ? routes.pickup_route 
          : routes.delivery_route;
          
        // Get completed orders to mark them in the route
        const { data: completedOrders } = await supabase
          .from('orders')
          .select('id, status')
          .in('status', ['delivered', 'completed'])
          .in('id', routeData.map((stop: RouteStop) => stop.orderId));
          
        // Create a set of completed order IDs for faster lookup
        const completedOrderIds = new Set(
          (completedOrders || []).map((order: any) => order.id)
        );
        
        // Mark completed stops
        const routeWithCompletionStatus = routeData.map((stop: RouteStop) => ({
          ...stop,
          completed: completedOrderIds.has(stop.orderId)
        }));
        
        setStops(routeWithCompletionStatus);
        setLastUpdated(new Date(routes.created_at));
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast({
        variant: "destructive",
        title: "Failed to load routes",
        description: "Could not retrieve your delivery routes. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizedRoutes();
  }, [timeSlot, routeType]);

  const handleStatusUpdate = () => {
    // Reset selected order and refresh routes
    setSelectedOrder(null);
    fetchOptimizedRoutes();
    
    toast({
      title: "Status updated",
      description: "The order status has been successfully updated"
    });
  };

  const getCompletedCount = () => {
    return stops.filter(stop => stop.completed).length;
  };

  const getProgressPercentage = () => {
    if (stops.length === 0) return 0;
    return (getCompletedCount() / stops.length) * 100;
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Card className="border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center justify-between">
            <span>Today's Routes: {format(currentDate, 'EEEE, MMMM d')}</span>
            <Badge variant={timeSlot === 'morning' ? 'default' : 'outline'} className="mt-2 sm:mt-0">
              {timeSlot === 'morning' ? 'Morning Shift (7PM-1PM)' : 'Afternoon Shift (1PM-7PM)'}
            </Badge>
          </CardTitle>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {format(lastUpdated, 'h:mm a')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Route className="h-4 w-4 mr-1 text-primary" />
              <span className="text-sm font-medium">Optimized Route</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{getCompletedCount()} of {stops.length} complete</span>
              <span className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <span 
                  className="h-full bg-green-500 block" 
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs 
        value={routeType} 
        onValueChange={(value) => setRouteType(value as 'pickups' | 'deliveries')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pickups" className="flex items-center justify-center">
            <Package className="h-4 w-4 mr-2" />
            Pickups
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center justify-center">
            <Truck className="h-4 w-4 mr-2" />
            Deliveries
          </TabsTrigger>
        </TabsList>
        
        <div className="flex justify-between items-center mt-4">
          <h3 className="text-md font-medium">
            {routeType === 'pickups' ? 'Pickup' : 'Delivery'} Route ({stops.length} stops)
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTimeSlot(timeSlot === 'morning' ? 'afternoon' : 'morning')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Switch Shift
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOptimizedRoutes} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {selectedOrder ? (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedOrder(null)}
                className="p-0 h-auto mb-2"
              >
                ← Back to route
              </Button>
              <CardTitle>Update Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingUpdate 
                orderId={selectedOrder} 
                currentStatus={stops.find(s => s.orderId === selectedOrder)?.completed ? 'delivered' : 'out_for_delivery'}
                onUpdateSuccess={handleStatusUpdate}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12 mt-4">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : stops.length === 0 ? (
              <Card className="text-center py-8 mt-4">
                <CardContent>
                  <p className="text-muted-foreground">No optimized routes available for this time period</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="w-full mt-4">
                {stops.map((stop, index) => (
                  <AccordionItem 
                    key={stop.id} 
                    value={stop.id} 
                    className={`border rounded-lg mb-2 overflow-hidden ${stop.completed ? 'bg-gray-50' : ''}`}
                  >
                    <AccordionTrigger className="hover:bg-gray-50 px-4 py-2">
                      <div className="flex-1 flex items-center">
                        <div className={`w-8 h-8 rounded-full ${stop.completed ? 'bg-green-500' : 'bg-primary'} text-white flex items-center justify-center mr-3 flex-shrink-0`}>
                          {stop.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{stop.productTitle}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                            {stop.location.address}
                          </p>
                        </div>
                        {stop.preferredTime && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                            {stop.preferredTime}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{stop.location.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <User className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">
                              {stop.type === 'pickup' ? 'Pickup from' : 'Deliver to'} {stop.personName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">Status</p>
                            <Badge 
                              variant={stop.completed ? 'success' : 'outline'}
                              className="mt-1"
                            >
                              {stop.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                          {!stop.completed && (
                            <Button className="flex-1" variant="default" onClick={() => setSelectedOrder(stop.orderId)}>
                              Update Status
                            </Button>
                          )}
                          
                          <Button className="flex-1" variant="outline" asChild>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${stop.location.latitude},${stop.location.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Directions
                            </a>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </Tabs>
      
      <div className="mt-6">
        <p className="text-center text-muted-foreground text-sm">
          Tap on a stop to see details and update the order status
        </p>
      </div>
    </div>
  );
};
