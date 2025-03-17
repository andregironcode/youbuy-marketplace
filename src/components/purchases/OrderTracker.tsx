import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Package, 
  Truck, 
  Clock, 
  Check, 
  MapPin, 
  AlertCircle 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationMap } from "@/components/map/LocationMap";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderStage {
  code: string;
  name: string;
  description: string;
  display_order: number;
}

interface StatusHistory {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  location_lat: number | null;
  location_lng: number | null;
}

interface OrderTrackerProps {
  orderId: string;
  currentStatus: string;
  orderDate: string;
  estimatedDelivery?: string | null;
  orderAddress?: any;
}

export const OrderTracker = ({ 
  orderId, 
  currentStatus, 
  orderDate,
  estimatedDelivery,
  orderAddress
}: OrderTrackerProps) => {
  const [stages, setStages] = useState<OrderStage[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [currentStage, setCurrentStage] = useState<OrderStage | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrderTracking = async () => {
      console.log("Fetching tracking info for order:", orderId, "with status:", currentStatus);
      setIsLoading(true);
      try {
        // Get all delivery stages
        const { data: stagesData, error: stagesError } = await supabase
          .from("delivery_stages")
          .select("*")
          .order("display_order");
          
        if (stagesError) {
          console.error("Error fetching stages:", stagesError);
          throw stagesError;
        }
        
        console.log("Got stages data:", stagesData);
        
        // Get order status history
        const { data: historyData, error: historyError } = await supabase
          .from("order_status_history")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at", { ascending: false });
          
        if (historyError) {
          console.error("Error fetching history:", historyError);
          throw historyError;
        }
        
        console.log("Got history data:", historyData);
        
        // Get latest status with location if available
        const latestWithLocation = historyData?.find(entry => 
          entry.location_lat && entry.location_lng
        );
        
        if (latestWithLocation && latestWithLocation.location_lat && latestWithLocation.location_lng) {
          setMapCoordinates({
            lat: latestWithLocation.location_lat,
            lng: latestWithLocation.location_lng
          });
          console.log("Set map coordinates from history:", mapCoordinates);
        } else if (orderAddress?.latitude && orderAddress?.longitude) {
          // Fall back to delivery address
          setMapCoordinates({
            lat: orderAddress.latitude,
            lng: orderAddress.longitude
          });
          console.log("Set map coordinates from address:", mapCoordinates);
        }
        
        // Find current stage
        const current = stagesData?.find(stage => stage.code === currentStatus);
        console.log("Current stage found:", current);
        
        if (current && stagesData) {
          setCurrentStage(current);
          
          // Calculate progress percentage
          const totalStages = stagesData.filter(s => 
            s.display_order <= stagesData.find(ds => ds.code === 'delivered')!.display_order
          ).length;
          
          const currentIndex = stagesData.findIndex(s => s.code === current.code);
          
          if (current.code === 'cancelled') {
            setProgress(0);
          } else if (current.code === 'delivered' || current.code === 'completed') {
            setProgress(100);
          } else {
            const progressValue = Math.round((currentIndex / (totalStages - 1)) * 100);
            setProgress(progressValue);
          }
          
          console.log("Set progress to:", progress);
        }
        
        setStages(stagesData || []);
        setStatusHistory(historyData || []);
      } catch (error) {
        console.error("Error fetching order tracking:", error);
        toast({
          variant: "destructive",
          title: "Error loading tracking information",
          description: "Could not load the order status information."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderTracking();
    }
  }, [orderId, currentStatus]);
  
  const getStageIcon = (code: string) => {
    switch (code) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'preparing':
      case 'pickup_scheduled':
        return <Package className="h-5 w-5" />;
      case 'picked_up':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
      case 'completed':
        return <Check className="h-5 w-5" />;
      case 'cancelled':
      case 'returned':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };
  
  const getStageStatus = (stageCode: string) => {
    if (!currentStage) return 'inactive';
    
    const stageOrder = stages.find(s => s.code === stageCode)?.display_order || 0;
    const currentOrder = currentStage.display_order;
    
    if (currentStage.code === 'cancelled') {
      return stageCode === 'cancelled' ? 'active' : 'inactive';
    }
    
    if (stageOrder < currentOrder) return 'completed';
    if (stageOrder === currentOrder) return 'active';
    return 'inactive';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'confirmed':
      case 'preparing':
        return "bg-blue-100 text-blue-800";
      case 'pickup_scheduled':
      case 'picked_up':
      case 'in_transit':
        return "bg-purple-100 text-purple-800";
      case 'out_for_delivery':
        return "bg-indigo-100 text-indigo-800";
      case 'delivered':
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
      case 'returned':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStage && getStageIcon(currentStage.code)}
            <h3 className="font-medium">{currentStage?.name || "Processing Order"}</h3>
          </div>
          <Badge className={getStatusColor(currentStatus)}>
            {currentStage?.name || currentStatus}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Order placed</span>
          <span>{currentStage?.code === 'cancelled' ? 'Cancelled' : 'Delivered'}</span>
        </div>
      </div>
      
      {estimatedDelivery && currentStage?.code !== 'cancelled' && (
        <div className="bg-gray-50 p-3 rounded-md flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Estimated Delivery</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(estimatedDelivery), "PPP")}
            </p>
          </div>
        </div>
      )}
      
      {mapCoordinates && (
        <div className="rounded-md border overflow-hidden">
          <div className="p-3 bg-gray-50 border-b">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {currentStage?.code === 'delivered' ? 'Delivery Location' : 'Current Location'}
            </h4>
          </div>
          <LocationMap
            latitude={mapCoordinates.lat}
            longitude={mapCoordinates.lng}
            height="200px"
            zoom={14}
            showMarker={true}
            interactive={false}
          />
        </div>
      )}
      
      <div className="space-y-4">
        <h4 className="font-medium">Order Timeline</h4>
        <div className="space-y-4">
          {statusHistory.length > 0 ? (
            <div className="space-y-3">
              {statusHistory.map((status, index) => {
                const stageName = stages.find(s => s.code === status.status)?.name || status.status;
                return (
                  <div key={status.id} className="flex items-start gap-3">
                    <div className={`mt-1 p-1 rounded-full ${getStatusColor(status.status)}`}>
                      {getStageIcon(status.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{stageName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(status.created_at), "PPp")}
                        </p>
                      </div>
                      {status.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{status.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No detailed status updates available.</p>
            </div>
          )}
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-1 p-1 rounded-full bg-gray-100">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">Order Placed</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(orderDate), "PPp")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
