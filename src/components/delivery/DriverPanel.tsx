import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationMap } from "@/components/map/LocationMap";
import { useToast } from "@/hooks/use-toast";

interface Route {
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
}

export const DriverPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Route | null>(null);
  const [timeSlot, setTimeSlot] = useState<string>("morning");
  const [routeType, setRouteType] = useState<"pickup" | "delivery">("pickup");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutes();
  }, [currentDate, timeSlot, routeType]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("delivery_routes")
        .select(`
          *,
          orders (
            customer_name,
            customer_phone
          )
        `)
        .eq("date", currentDate.toISOString().split("T")[0])
        .eq("time_slot", timeSlot)
        .eq("route_type", routeType)
        .order("scheduled_time");

      if (error) throw error;

      const formattedRoutes = data.map(route => ({
        ...route,
        customer_name: route.orders?.customer_name || "Unknown",
        customer_phone: route.orders?.customer_phone || "Unknown"
      }));

      setRoutes(formattedRoutes);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to load delivery routes");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load delivery routes"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase.rpc("update_order_status", {
        p_order_id: orderId,
        p_status: status,
        p_notes: "Status updated by driver"
      });

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully"
      });

      fetchRoutes();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    if (!selectedOrder) return;

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        variant: "destructive",
        title: "Invalid location",
        description: "Please select a valid location on the map."
      });
      return;
    }

    setUpdatingLocation(true);
    try {
      const { error } = await supabase.rpc("update_order_location", {
        p_order_id: selectedOrder.order_id,
        p_lat: lat,
        p_lng: lng
      });

      if (error) throw error;

      toast({
        title: "Location Updated",
        description: "Order location has been updated successfully"
      });
    } catch (err) {
      console.error("Error updating order location:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order location"
      });
    } finally {
      setUpdatingLocation(false);
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
        <div className="flex items-center justify-between">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRoutes}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Route Settings</h3>
              <Button
                variant="outline"
                onClick={fetchRoutes}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Route Type</label>
              <Select
                value={routeType}
                onValueChange={(value: "pickup" | "delivery") => setRouteType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup Routes</SelectItem>
                  <SelectItem value="delivery">Delivery Routes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Route List</h3>
          <div className="space-y-4">
            {routes.length > 0 ? (
              routes.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrder?.id === route.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOrder(route)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{route.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {routeType === "pickup" ? route.pickup_address : route.delivery_address}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      route.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : route.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {route.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Scheduled: {new Date(route.scheduled_time).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No routes available for the selected criteria
              </p>
            )}
          </div>
        </Card>
      </div>

      {selectedOrder && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Customer:</span> {selectedOrder.customer_name}</p>
                <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                <p><span className="font-medium">Address:</span> {
                  routeType === "pickup" ? selectedOrder.pickup_address : selectedOrder.delivery_address
                }</p>
                <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-medium">Scheduled Time:</span> {
                  new Date(selectedOrder.scheduled_time).toLocaleString()
                }</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <div className="h-[300px] rounded-md overflow-hidden">
                <LocationMap
                  height="100%"
                  zoom={13}
                  interactive={true}
                  showMarker={true}
                  latitude={routeType === "pickup" ? selectedOrder.pickup_lat : selectedOrder.delivery_lat}
                  longitude={routeType === "pickup" ? selectedOrder.pickup_lng : selectedOrder.delivery_lng}
                  onLocationSelect={handleLocationSelect}
                  onError={handleMapError}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Update Status</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateOrderStatus(selectedOrder.order_id, "in_progress")}
                  disabled={selectedOrder.status === "completed" || updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Start Delivery"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateOrderStatus(selectedOrder.order_id, "completed")}
                  disabled={selectedOrder.status === "completed" || updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Complete Delivery"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
