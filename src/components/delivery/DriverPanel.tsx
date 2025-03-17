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
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { LocationMap } from "@/components/map/LocationMap";

type DriverRoute = {
  id: string;
  type: 'pickup' | 'delivery';
  orderId: string;
  productTitle: string;
  address: string;
  latitude: number;
  longitude: number;
  personName: string;
  currentStatus: string;
  time: string | null;
};

export const DriverPanel = () => {
  const [currentDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon'>(
    new Date().getHours() < 13 ? 'morning' : 'afternoon'
  );
  const [routeType, setRouteType] = useState<'pickups' | 'deliveries'>('pickups');
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      const startTime = timeSlot === 'morning' ? '19:00:00' : '13:00:00';
      const endTime = timeSlot === 'morning' ? '13:00:00' : '19:00:00';
      
      const previousDay = new Date(currentDate);
      previousDay.setDate(previousDay.getDate() - (timeSlot === 'morning' ? 1 : 0));
      const formattedPreviousDay = format(previousDay, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          current_stage,
          created_at,
          products:product_id (
            title,
            location,
            latitude,
            longitude
          ),
          delivery_details,
          buyer:buyer_id (
            full_name
          ),
          seller:seller_id (
            full_name
          )
        `)
        .gte('created_at', `${formattedPreviousDay} ${startTime}`)
        .lte('created_at', `${formattedDate} ${endTime}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const driverRoutes: DriverRoute[] = [];
      
      (data || []).forEach((order: any) => {
        if (routeType === 'pickups') {
          driverRoutes.push({
            id: `pickup-${order.id}`,
            type: 'pickup',
            orderId: order.id,
            productTitle: order.products?.title || 'Unknown Product',
            address: order.products?.location || 'Unknown Location',
            latitude: order.products?.latitude || 0,
            longitude: order.products?.longitude || 0,
            personName: order.seller?.full_name || 'Unknown Seller',
            currentStatus: order.current_stage || order.status,
            time: null,
          });
        } else {
          const deliveryDetails = typeof order.delivery_details === 'string'
            ? JSON.parse(order.delivery_details)
            : order.delivery_details;
          
          driverRoutes.push({
            id: `delivery-${order.id}`,
            type: 'delivery',
            orderId: order.id,
            productTitle: order.products?.title || 'Unknown Product',
            address: deliveryDetails?.address || 'Unknown Location',
            latitude: deliveryDetails?.latitude || 0,
            longitude: deliveryDetails?.longitude || 0,
            personName: order.buyer?.full_name || 'Unknown Buyer',
            currentStatus: order.current_stage || order.status,
            time: deliveryDetails?.preferred_time || null,
          });
        }
      });
      
      const sortedRoutes = driverRoutes.sort((a, b) => {
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        
        return a.latitude - b.latitude;
      });
      
      setRoutes(sortedRoutes);
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
    fetchRoutes();
  }, [timeSlot, routeType]);

  const handleStatusUpdate = () => {
    setSelectedOrder(null);
    fetchRoutes();
    
    toast({
      title: "Status updated",
      description: "The order status has been successfully updated."
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Card className="border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center justify-between">
            <span>Today's Routes: {format(currentDate, 'EEEE, MMMM d')}</span>
            <Badge variant={timeSlot === 'morning' ? 'default' : 'outline'} className="mt-2 sm:mt-0">
              {timeSlot === 'morning' ? 'Morning Shift' : 'Afternoon Shift'}
            </Badge>
          </CardTitle>
        </CardHeader>
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
        
        <TabsContent value="pickups" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">Pickup Route ({routes.length} stops)</h3>
            <Button variant="outline" size="sm" onClick={fetchRoutes} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {selectedOrder ? (
            <Card>
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
                  currentStatus={routes.find(r => r.orderId === selectedOrder)?.currentStatus || ''}
                  onUpdateSuccess={handleStatusUpdate}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : routes.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No pickups scheduled for this time period</p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {routes.map((stop, index) => (
                    <AccordionItem key={stop.id} value={stop.id} className="border rounded-lg mb-2 overflow-hidden">
                      <AccordionTrigger className="hover:bg-gray-50 px-4 py-2">
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{stop.productTitle}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                              {stop.address}
                            </p>
                          </div>
                          {stop.time && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                              {stop.time}
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
                              <p className="text-sm text-muted-foreground">{stop.address}</p>
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
                                variant={stop.currentStatus === 'delivered' ? 'default' : stop.currentStatus === 'out_for_delivery' ? 'default' : 'outline'}
                                className="mt-1"
                              >
                                {stop.currentStatus}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            <Button className="flex-1" variant="default" onClick={() => setSelectedOrder(stop.orderId)}>
                              Update Status
                            </Button>
                            
                            <Button className="flex-1" variant="outline" asChild>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
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
        </TabsContent>
        
        <TabsContent value="deliveries" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">Delivery Route ({routes.length} stops)</h3>
            <Button variant="outline" size="sm" onClick={fetchRoutes} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {selectedOrder ? (
            <Card>
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
                  currentStatus={routes.find(r => r.orderId === selectedOrder)?.currentStatus || ''}
                  onUpdateSuccess={handleStatusUpdate}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : routes.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No deliveries scheduled for this time period</p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {routes.map((stop, index) => (
                    <AccordionItem key={stop.id} value={stop.id} className="border rounded-lg mb-2 overflow-hidden">
                      <AccordionTrigger className="hover:bg-gray-50 px-4 py-2">
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{stop.productTitle}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                              {stop.address}
                            </p>
                          </div>
                          {stop.time && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                              {stop.time}
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
                              <p className="text-sm text-muted-foreground">{stop.address}</p>
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
                                variant={stop.currentStatus === 'delivered' ? 'default' : stop.currentStatus === 'out_for_delivery' ? 'default' : 'outline'}
                                className="mt-1"
                              >
                                {stop.currentStatus}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            <Button className="flex-1" variant="default" onClick={() => setSelectedOrder(stop.orderId)}>
                              Update Status
                            </Button>
                            
                            <Button className="flex-1" variant="outline" asChild>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
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
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <p className="text-center text-muted-foreground text-sm">
          Tap on a stop to see details and update the order status
        </p>
      </div>
    </div>
  );
};
