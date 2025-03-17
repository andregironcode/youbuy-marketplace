
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Package, Truck, ChevronRight, DownloadCloud, RefreshCw } from "lucide-react";

type DeliveryOrder = {
  id: string;
  product_title: string;
  created_at: string;
  pickup_location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  delivery_location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  buyer_name: string;
  seller_name: string;
  status: string;
  preferred_time: string | null;
};

type RouteStop = {
  id: string;
  type: 'pickup' | 'delivery';
  address: string;
  latitude: number;
  longitude: number;
  orderId: string;
  productTitle: string;
  personName: string;
  time: string | null;
};

// Helper function to safely extract string from JSON
const getJsonString = (json: any, key: string, defaultValue: string = 'Unknown Location'): string => {
  if (!json) return defaultValue;
  if (typeof json === 'string') {
    try {
      const parsed = JSON.parse(json);
      return parsed[key] || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  return json[key] || defaultValue;
};

// Helper function to safely extract number from JSON
const getJsonNumber = (json: any, key: string, defaultValue: number = 0): number => {
  if (!json) return defaultValue;
  if (typeof json === 'string') {
    try {
      const parsed = JSON.parse(json);
      return parsed[key] || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  return json[key] || defaultValue;
};

export const DeliveryRoutes = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon'>('morning');
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeType, setRouteType] = useState<'pickups' | 'deliveries'>('pickups');
  const { toast } = useToast();

  // Fetch orders for the selected date
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Format the date to YYYY-MM-DD for database query
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Set time boundaries based on the selected time slot
      const startTime = timeSlot === 'morning' ? '19:00:00' : '13:00:00';
      const endTime = timeSlot === 'morning' ? '13:00:00' : '19:00:00';
      
      // Since we're checking orders from the previous evening (7pm) if morning slot
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - (timeSlot === 'morning' ? 1 : 0));
      const formattedPreviousDay = format(previousDay, 'yyyy-MM-dd');
      
      // Query to get orders within the time range
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          products:product_id (
            title,
            location,
            latitude,
            longitude
          ),
          delivery_details,
          buyer_id,
          seller_id
        `)
        .gte('created_at', `${formattedPreviousDay} ${startTime}`)
        .lte('created_at', `${formattedDate} ${endTime}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Fetch buyer and seller profiles separately to avoid RLS issues
      const buyerIds = data?.map(order => order.buyer_id) || [];
      const sellerIds = data?.map(order => order.seller_id) || [];
      
      const { data: buyerProfiles, error: buyerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', buyerIds);
      
      if (buyerError) throw buyerError;
      
      const { data: sellerProfiles, error: sellerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', sellerIds);
      
      if (sellerError) throw sellerError;
      
      // Create lookup maps for buyer and seller names
      const buyerMap = Object.fromEntries(
        (buyerProfiles || []).map(profile => [profile.id, profile.full_name || 'Unknown Buyer'])
      );
      
      const sellerMap = Object.fromEntries(
        (sellerProfiles || []).map(profile => [profile.id, profile.full_name || 'Unknown Seller'])
      );
      
      // Transform and enrich the order data
      const enrichedOrders = (data || []).map(order => ({
        id: order.id,
        product_title: order.products?.title || 'Unknown Product',
        created_at: order.created_at,
        pickup_location: {
          address: order.products?.location || 'Unknown Location',
          latitude: order.products?.latitude || 0,
          longitude: order.products?.longitude || 0,
        },
        delivery_location: {
          address: getJsonString(order.delivery_details, 'address'),
          latitude: getJsonNumber(order.delivery_details, 'latitude'),
          longitude: getJsonNumber(order.delivery_details, 'longitude'),
        },
        buyer_name: buyerMap[order.buyer_id] || 'Unknown Buyer',
        seller_name: sellerMap[order.seller_id] || 'Unknown Seller',
        status: order.status,
        preferred_time: getJsonString(order.delivery_details, 'preferred_time', null),
      }));
      
      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
      toast({
        variant: "destructive",
        title: "Failed to load routes",
        description: "There was an error loading the delivery routes."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [date, timeSlot]);

  // Organize route stops based on selected route type
  const routeStops = useMemo(() => {
    const stops: RouteStop[] = [];
    
    orders.forEach(order => {
      if (routeType === 'pickups') {
        stops.push({
          id: `pickup-${order.id}`,
          type: 'pickup',
          address: order.pickup_location.address,
          latitude: order.pickup_location.latitude,
          longitude: order.pickup_location.longitude,
          orderId: order.id,
          productTitle: order.product_title,
          personName: order.seller_name,
          time: null,
        });
      } else {
        stops.push({
          id: `delivery-${order.id}`,
          type: 'delivery',
          address: order.delivery_location.address,
          latitude: order.delivery_location.latitude,
          longitude: order.delivery_location.longitude,
          orderId: order.id,
          productTitle: order.product_title,
          personName: order.buyer_name,
          time: order.preferred_time,
        });
      }
    });
    
    // Sort by preferred time if available, otherwise group geographically
    // This is a simple implementation - in a real app you would use a more sophisticated
    // algorithm to optimize routes based on distance, traffic, etc.
    return stops.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      // Simple geographical sort - group by latitude
      return a.latitude - b.latitude;
    });
  }, [orders, routeType]);

  // Generate a download URL for the route data
  const generateRouteDownload = () => {
    const routeData = {
      date: format(date, 'yyyy-MM-dd'),
      timeSlot,
      routeType,
      stops: routeStops.map(stop => ({
        type: stop.type,
        address: stop.address,
        coordinates: {
          latitude: stop.latitude,
          longitude: stop.longitude
        },
        orderId: stop.orderId,
        productTitle: stop.productTitle,
        personName: stop.personName,
        preferredTime: stop.time
      }))
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routeData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `route-${format(date, 'yyyy-MM-dd')}-${timeSlot}-${routeType}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    toast({
      title: "Route data downloaded",
      description: "The route data has been saved to your device."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Routes</h1>
        <p className="text-muted-foreground">Optimize pickup and delivery routes for drivers</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Route Options</CardTitle>
            <CardDescription>Configure route parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={timeSlot} onValueChange={(value) => setTimeSlot(value as 'morning' | 'afternoon')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (7PM previous day to 1PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (1PM to 7PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Route Type</Label>
              <Tabs value={routeType} onValueChange={(value) => setRouteType(value as 'pickups' | 'deliveries')}>
                <TabsList className="w-full">
                  <TabsTrigger value="pickups" className="flex-1">
                    <Package className="mr-2 h-4 w-4" />
                    Pickups
                  </TabsTrigger>
                  <TabsTrigger value="deliveries" className="flex-1">
                    <Truck className="mr-2 h-4 w-4" />
                    Deliveries
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="pt-4 flex flex-col space-y-2">
              <Button onClick={fetchOrders} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {isLoading ? "Loading..." : "Refresh Routes"}
              </Button>
              
              <Button variant="outline" onClick={generateRouteDownload} disabled={isLoading || routeStops.length === 0}>
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export Route Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {routeType === 'pickups' ? 'Pickup Route' : 'Delivery Route'} ({routeStops.length} stops)
            </CardTitle>
            <CardDescription>
              Optimized route for {format(date, 'PPP')} - {timeSlot === 'morning' ? 'Morning' : 'Afternoon'} shift
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : routeStops.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No {routeType} scheduled for this time period</p>
                <Button variant="link" onClick={fetchOrders} className="mt-2">
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div>
                <Accordion type="single" collapsible className="w-full">
                  {routeStops.map((stop, index) => (
                    <AccordionItem key={stop.id} value={stop.id}>
                      <AccordionTrigger className="hover:bg-gray-50 px-4">
                        <div className="flex-1 flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-left">{stop.productTitle}</p>
                            <p className="text-sm text-muted-foreground text-left">
                              {stop.address.substring(0, 40)}{stop.address.length > 40 ? '...' : ''}
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
                            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">{stop.address}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Lat: {stop.latitude.toFixed(6)}, Lng: {stop.longitude.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className={`h-5 w-5 mr-2 ${stop.type === 'pickup' ? 'text-amber-500' : 'text-green-500'}`}>
                              {stop.type === 'pickup' ? <Package /> : <Truck />}
                            </div>
                            <div>
                              <p className="font-medium">
                                {stop.type === 'pickup' ? 'Pickup from' : 'Deliver to'} {stop.personName}
                              </p>
                              <p className="text-sm text-muted-foreground">Order #{stop.orderId.substring(0, 8)}</p>
                            </div>
                          </div>
                          
                          <Button className="w-full" variant="secondary" asChild>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open in Maps <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
