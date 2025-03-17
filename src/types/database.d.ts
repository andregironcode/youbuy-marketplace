
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

// Type guards
export function isValidTimeSlot(value: string): value is 'morning' | 'afternoon' {
  return value === 'morning' || value === 'afternoon';
}
