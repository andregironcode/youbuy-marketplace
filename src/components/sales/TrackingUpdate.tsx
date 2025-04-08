import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LocationMap } from "@/components/map/LocationMap";
import { handleOrderStatusUpdate } from "@/utils/orderUtils";

const statusUpdateSchema = z.object({
  status: z.string({
    required_error: "Please select a status"
  }),
  notes: z.string().optional(),
});

// Map our status codes to Shipday status codes
const SHIPDAY_STATUS_MAP: Record<string, string> = {
  'pending': 'pending',
  'confirmed': 'confirmed',
  'preparing': 'preparing',
  'pickup_scheduled': 'scheduled',
  'picked_up': 'picked_up',
  'in_transit': 'in_transit',
  'out_for_delivery': 'out_for_delivery',
  'delivered': 'delivered',
  'completed': 'completed',
  'cancelled': 'cancelled',
  'returned': 'returned'
};

interface TrackingUpdateProps {
  orderId: string;
  currentStatus: string;
  onUpdateSuccess: () => void;
}

export const TrackingUpdate = ({ 
  orderId, 
  currentStatus, 
  onUpdateSuccess 
}: TrackingUpdateProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [locationSelected, setLocationSelected] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchStages = async () => {
      const { data, error } = await supabase
        .from("delivery_stages")
        .select("*")
        .order("display_order");

      if (error) {
        console.error("Error fetching delivery stages:", error);
        return;
      }

      if (data) {
        console.log("Fetched delivery stages:", data);
        setStages(data);
        
        // Find next logical status
        const currentStageIndex = data.findIndex(stage => stage.code === currentStatus);
        const nextStage = data[currentStageIndex + 1];
        
        if (nextStage) {
          form.setValue("status", nextStage.code);
        }
      }
    };

    fetchStages();
  }, [currentStatus, form]);

  const handleLocationSelect = (lat: number, lng: number) => {
    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        variant: "destructive",
        title: "Invalid location",
        description: "Please select a valid location on the map."
      });
      return;
    }
    
    setMapCoordinates({ lat, lng });
    setLocationSelected(true);
  };

  const onSubmit = async (values: z.infer<typeof statusUpdateSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Map the status to Shipday's format
      const shipdayStatus = SHIPDAY_STATUS_MAP[values.status] || values.status;
      
      console.log("Updating order status with values:", {
        orderId,
        status: values.status,
        shipdayStatus,
        notes: values.notes,
        location: mapCoordinates
      });
      
      // Update order status in Supabase
      const { error } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_status: values.status,
        p_notes: values.notes || null,
        p_location_lat: mapCoordinates?.lat || null,
        p_location_lng: mapCoordinates?.lng || null
      });
      
      if (error) throw error;

      // Handle email notifications
      await handleOrderStatusUpdate({
        orderId,
        status: values.status,
        notes: values.notes
      });
      
      toast({
        title: "Status updated",
        description: "The order status has been successfully updated."
      });
      
      form.reset();
      setMapCoordinates(null);
      setLocationSelected(false);
      onUpdateSuccess();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the order status."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMapError = (error: Error) => {
    console.error("Map error:", error);
    toast({
      variant: "destructive",
      title: "Map error",
      description: "There was an error loading the map. Please try again."
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Update Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem 
                      key={stage.code} 
                      value={stage.code}
                      disabled={stage.code === currentStatus}
                    >
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional details about this status update"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Current Location (optional)</FormLabel>
          <div className="border rounded-md overflow-hidden">
            <LocationMap
              height="200px"
              zoom={12}
              interactive={true}
              onLocationSelect={handleLocationSelect}
              showMarker={locationSelected}
              latitude={mapCoordinates?.lat}
              longitude={mapCoordinates?.lng}
              onError={handleMapError}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Click on the map to set the current location of the package
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Order Status"
          )}
        </Button>
      </form>
    </Form>
  );
};
