
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Home, Building, MapPin } from "lucide-react";
import { LocationMap } from "@/components/map/LocationMap";
import { geocodeAddress, reverseGeocode } from "@/utils/locationUtils";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  locationType: z.enum(["house", "apartment"], {
    required_error: "Please select a location type.",
  }),
  houseNumber: z.string().optional(),
  buildingName: z.string().optional(),
  apartmentNumber: z.string().optional(),
  floor: z.string().optional(),
  additionalInfo: z.string().optional(),
  phone: z.string().min(8, {
    message: "Valid phone number is required.",
  }),
  deliveryTime: z.enum(["morning", "afternoon", "evening"], {
    required_error: "Please select a delivery time preference.",
  }),
  instructions: z.string().optional(),
  // Add these for map coordinates and address
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  formattedAddress: z.string().min(5, {
    message: "Please select a delivery location on the map.",
  }),
}).refine(data => {
  // If house type is selected, house number should be provided
  if (data.locationType === "house" && !data.houseNumber) {
    return false;
  }
  // If apartment type is selected, building name and apartment number should be provided
  if (data.locationType === "apartment" && (!data.buildingName || !data.apartmentNumber)) {
    return false;
  }
  // Coordinates should be provided
  if (!data.latitude || !data.longitude) {
    return false;
  }
  return true;
}, {
  message: "Please fill in the required fields for your location type and select a delivery location",
  path: ["locationType"],
});

export type CheckoutFormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  initialValues?: Partial<CheckoutFormValues>;
  onSubmit: (values: CheckoutFormValues) => void;
}

export function CheckoutForm({ initialValues, onSubmit }: CheckoutFormProps) {
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialValues?.latitude && initialValues?.longitude 
      ? { lat: initialValues.latitude, lng: initialValues.longitude } 
      : null
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialValues?.fullName || "",
      locationType: initialValues?.locationType || "house",
      houseNumber: initialValues?.houseNumber || "",
      buildingName: initialValues?.buildingName || "",
      apartmentNumber: initialValues?.apartmentNumber || "",
      floor: initialValues?.floor || "",
      additionalInfo: initialValues?.additionalInfo || "",
      phone: initialValues?.phone || "",
      deliveryTime: initialValues?.deliveryTime || "afternoon",
      instructions: initialValues?.instructions || "",
      latitude: initialValues?.latitude,
      longitude: initialValues?.longitude,
      formattedAddress: initialValues?.formattedAddress || "",
    },
  });

  const watchLocationType = form.watch("locationType");

  const handleLocationSelect = async (lat: number, lng: number, address: string) => {
    setMapCoordinates({ lat, lng });
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    form.setValue("formattedAddress", address);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="For delivery coordination" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="formattedAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Delivery Location
                  </FormLabel>
                  <div className="space-y-2">
                    <LocationMap
                      latitude={mapCoordinates?.lat}
                      longitude={mapCoordinates?.lng}
                      height="300px"
                      zoom={14}
                      interactive={true}
                      onLocationSelect={handleLocationSelect}
                      showMarker={true}
                      className="rounded-md border border-gray-200"
                    />
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Select a location on the map" 
                        readOnly 
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Click on the map to set your delivery location
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="locationType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Location Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="house" id="checkout-house" />
                      <FormLabel htmlFor="checkout-house" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        House
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apartment" id="checkout-apartment" />
                      <FormLabel htmlFor="checkout-apartment" className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        Apartment
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchLocationType === "house" ? (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gate code, landmark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="buildingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunset Towers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apartmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 502" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Buzzer code, landmark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="deliveryTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Delivery Time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9am - 12pm) - Next Day </SelectItem>
                    <SelectItem value="afternoon">Afternoon (12pm - 5pm) - Next Day </SelectItem>
                    <SelectItem value="evening">Evening (5pm - 9pm) - Today </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special instructions for delivery"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Continue to Payment</Button>
      </form>
    </Form>
  );
}
