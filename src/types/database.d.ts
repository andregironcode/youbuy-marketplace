
import { Json } from "@/integrations/supabase/types";

// Database types
export type DeliveryRouteResponse = {
  id: string;
  date: string;
  time_slot: string;
  pickup_route: Json;
  delivery_route: Json;
  status: string;
  created_at: string;
  updated_at: string | null;
};

// Route stop types
export type RouteStop = {
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

// Delivery route with properly typed properties
export type DeliveryRoute = {
  id: string;
  date: string;
  time_slot: "morning" | "afternoon" | "evening";
  pickup_route: RouteStop[];
  delivery_route: RouteStop[];
  status: string;
  created_at: string;
  updated_at: string | null;
};

// Type guards
export function isValidTimeSlot(value: string): value is 'morning' | 'afternoon' | 'evening' {
  return value === 'morning' || value === 'afternoon' || value === 'evening';
}
