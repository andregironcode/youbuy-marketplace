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
import { CalendarIcon, MapPin, Package, Truck, ChevronRight, DownloadCloud, RefreshCw, Loader2 } from "lucide-react";
import { LocationMap } from "@/components/map/LocationMap";

interface Order {
  id: string;
  order_id: string;
  pickup_address: string;
  delivery_address: string;
  pickup_lat: number;
  pickup_lng: number;
  delivery_lat: number;
  delivery_lng: number;
  status: string;
  scheduled_time: string;
  customer_name: string;
  customer_phone: string;
  buyer: {
    full_name: string;
    phone: string;
  };
  seller: {
    full_name: string;
    phone: string;
  };
}

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState<string>("morning");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [routeType, setRouteType] = useState<'pickups' | 'deliveries'>('pickups');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [selectedDate, timeSlot]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("delivery_routes")
        .select(`
          *,
          orders (
            buyer:buyer_id (
              full_name,
              phone
            ),
            seller:seller_id (
              full_name,
              phone
            )
          )
        `)
        .eq("date", selectedDate.toISOString().split("T")[0])
        .eq("time_slot", timeSlot)
        .order("scheduled_time");

      if (error) throw error;

      const formattedOrders = data.map(order => ({
        ...order,
        customer_name: order.orders?.buyer?.full_name || "Unknown",
        customer_phone: order.orders?.buyer?.phone || "Unknown",
        buyer: order.orders?.buyer || {},
        seller: order.orders?.seller || {}
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load delivery orders");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load delivery orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadRouteData = async () => {
    if (orders.length === 0) return;
    
    setDownloading(true);
    try {
      const csvData = orders.map(order => ({
        "Order ID": order.order_id,
        "Customer Name": order.customer_name,
        "Customer Phone": order.customer_phone,
        "Pickup Address": order.pickup_address,
        "Delivery Address": order.delivery_address,
        "Status": order.status,
        "Scheduled Time": new Date(order.scheduled_time).toLocaleString(),
        "Seller Name": order.seller.full_name,
        "Seller Phone": order.seller.phone
      }));

      const csv = Object.keys(csvData[0]).join(",") + "\n" +
        csvData.map(row => Object.values(row).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `delivery-routes-${selectedDate.toISOString().split("T")[0]}-${timeSlot}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading route data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download route data"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleMapError = (error: Error) => {
    console.error("Map error:", error);
    setMapError("Failed to load the map");
    toast({
      variant: "destructive",
      title: "Map error",
      description: "There was an error loading the map. Please try again."
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Delivery Routes</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={fetchOrders}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={downloadRouteData}
                disabled={orders.length === 0 || downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Download CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full p-2 border rounded-md"
                title="Select date for delivery routes"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot</label>
              <Select
                value={timeSlot}
                onValueChange={setTimeSlot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                  <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {order.order_id}</p>
                    <p><span className="font-medium">Customer:</span> {order.customer_name}</p>
                    <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
                    <p><span className="font-medium">Status:</span> {order.status}</p>
                    <p><span className="font-medium">Scheduled Time:</span> {
                      new Date(order.scheduled_time).toLocaleString()
                    }</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Pickup Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Seller:</span> {order.seller.full_name}</p>
                    <p><span className="font-medium">Phone:</span> {order.seller.phone}</p>
                    <p><span className="font-medium">Address:</span> {order.pickup_address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Delivery Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Address:</span> {order.delivery_address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Route Map</h3>
                  <div className="h-[300px] rounded-md overflow-hidden">
                    <LocationMap
                      height="100%"
                      zoom={13}
                      interactive={false}
                      showMarker={true}
                      latitude={order.delivery_lat}
                      longitude={order.delivery_lng}
                      onError={handleMapError}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 col-span-2 text-center">
            <p className="text-muted-foreground">No delivery orders found for the selected date and time slot.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
