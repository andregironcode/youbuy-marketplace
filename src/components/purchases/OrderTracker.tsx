import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Package, 
  Truck, 
  Clock, 
  Check, 
  MapPin, 
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationMap } from "@/components/map/LocationMap";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface OrderStage {
  code: string;
  name: string;
  display_order: number;
}

interface StatusHistory {
  status: string;
  notes: string | null;
  created_at: string;
  location_lat: number | null;
  location_lng: number | null;
}

interface OrderTrackerProps {
  orderId: string;
  mockData?: {
    stages?: OrderStage[];
    statusHistory?: StatusHistory[];
  };
}

export const OrderTracker = ({ orderId, mockData }: OrderTrackerProps) => {
  const [stages, setStages] = useState<OrderStage[]>(mockData?.stages || []);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>(mockData?.statusHistory || []);
  const [currentStage, setCurrentStage] = useState<OrderStage | null>(null);
  const [progress, setProgress] = useState(0);
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrackingInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch delivery stages
      const { data: stagesData, error: stagesError } = await supabase
        .from("delivery_stages")
        .select("*")
        .order("display_order");

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // Fetch order status history
      const { data: historyData, error: historyError } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;
      setStatusHistory(historyData || []);

      // Get current status from the latest history entry
      if (historyData && historyData.length > 0) {
        const currentStatus = historyData[0].status;
        const currentStage = stagesData.find(stage => stage.code === currentStatus);
        setCurrentStage(currentStage || null);

        // Calculate progress
        const currentIndex = stagesData.findIndex(stage => stage.code === currentStatus);
        const progress = (currentIndex / (stagesData.length - 1)) * 100;
        setProgress(progress);

        // Set map coordinates if available
        if (historyData[0].location_lat && historyData[0].location_lng) {
          setMapCoordinates({
            lat: historyData[0].location_lat,
            lng: historyData[0].location_lng
          });
        }
      } else {
        setCurrentStage(null);
        setProgress(0);
        setMapCoordinates(null);
      }
    } catch (err) {
      console.error("Error fetching tracking info:", err);
      setError("Failed to load tracking information");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tracking information. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mockData) {
      fetchTrackingInfo();
    }
  }, [orderId]);

  const handleMapError = (error: Error) => {
    console.error("Map error:", error);
    setMapError("Failed to load the map");
    toast({
      variant: "destructive",
      title: "Map error",
      description: "There was an error loading the map. Please try again."
    });
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'pickup_scheduled':
        return '📅';
      case 'picked_up':
        return '📦';
      case 'in_transit':
        return '🚚';
      case 'out_for_delivery':
        return '🛵';
      case 'delivered':
        return '🏠';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '❌';
      case 'returned':
        return '↩️';
      default:
        return '•';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'preparing':
        return 'text-purple-500';
      case 'pickup_scheduled':
        return 'text-indigo-500';
      case 'picked_up':
        return 'text-green-500';
      case 'in_transit':
        return 'text-blue-500';
      case 'out_for_delivery':
        return 'text-orange-500';
      case 'delivered':
        return 'text-green-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      case 'returned':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
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
            onClick={fetchTrackingInfo}
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Current Status</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTrackingInfo}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <span className={`text-xl ${getStatusColor(currentStage?.code || '')}`}>
                {getStageIcon(currentStage?.code || '')}
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold">{currentStage?.name || 'No status updates yet'}</p>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {mapCoordinates && !mapError && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Location</h3>
          <div className="h-[300px] rounded-md overflow-hidden">
            <LocationMap
              height="100%"
              zoom={13}
              interactive={false}
              showMarker={true}
              latitude={mapCoordinates.lat}
              longitude={mapCoordinates.lng}
              onError={handleMapError}
            />
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status History</h3>
        <div className="space-y-4">
          {statusHistory.length > 0 ? (
            statusHistory.map((status, index) => (
              <div key={index} className="flex items-start space-x-4">
                <span className={`text-xl ${getStatusColor(status.status)}`}>
                  {getStageIcon(status.status)}
                </span>
                <div className="flex-1">
                  <p className="font-medium">
                    {stages.find(s => s.code === status.status)?.name || status.status}
                  </p>
                  {status.notes && (
                    <p className="text-sm text-gray-500">{status.notes}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(status.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No status updates available yet
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
