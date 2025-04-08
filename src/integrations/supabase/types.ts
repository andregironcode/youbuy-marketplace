export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          product_id: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          product_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          product_id?: string
          seller_id?: string
        }
        Relationships: []
      }
      delivery_routes: {
        Row: {
          created_at: string
          date: string
          delivery_route: Json | null
          id: string
          pickup_route: Json | null
          status: string | null
          time_slot: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          date: string
          delivery_route?: Json | null
          id?: string
          pickup_route?: Json | null
          status?: string | null
          time_slot: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          delivery_route?: Json | null
          id?: string
          pickup_route?: Json | null
          status?: string | null
          time_slot?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_stages: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order: number
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      driver_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_online: boolean | null
          last_login: string | null
          shipday_auth_url: string | null
          shipday_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_login?: string | null
          shipday_auth_url?: string | null
          shipday_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_login?: string | null
          shipday_auth_url?: string | null
          shipday_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorite_sellers: {
        Row: {
          created_at: string
          id: string
          seller_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seller_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seller_id?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          product_id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          product_id: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          product_id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          read?: boolean
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_tracking"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          current_stage: string | null
          delivery_confirmed_at: string | null
          delivery_details: Json | null
          dispute_deadline: string | null
          dispute_reason: string | null
          id: string
          last_status_change: string | null
          last_updated_by: string | null
          order_number: number
          payment_status: string | null
          payment_confirmed_at: string | null
          payment_method: string | null
          product_id: string
          seller_id: string
          shipday_order_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          current_stage?: string | null
          delivery_confirmed_at?: string | null
          delivery_details?: Json | null
          dispute_deadline?: string | null
          dispute_reason?: string | null
          id?: string
          last_status_change?: string | null
          last_updated_by?: string | null
          order_number?: number
          payment_status?: string | null
          payment_confirmed_at?: string | null
          payment_method?: string | null
          product_id: string
          seller_id: string
          shipday_order_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          current_stage?: string | null
          delivery_confirmed_at?: string | null
          delivery_details?: Json | null
          dispute_deadline?: string | null
          dispute_reason?: string | null
          id?: string
          last_status_change?: string | null
          last_updated_by?: string | null
          order_number?: number
          payment_status?: string | null
          payment_confirmed_at?: string | null
          payment_method?: string | null
          product_id?: string
          seller_id?: string
          shipday_order_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_fees: {
        Row: {
          active: boolean | null
          created_at: string | null
          fee_percentage: number
          id: string
          minimum_fee: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          fee_percentage?: number
          id?: string
          minimum_fee?: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          fee_percentage?: number
          id?: string
          minimum_fee?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          bulk_quantity: string | null
          category: string
          created_at: string
          description: string
          id: string
          image_urls: string[] | null
          is_bulk_listing: boolean | null
          latitude: number | null
          like_count: number
          location: string
          longitude: number | null
          order_id: string | null
          price: string
          product_status: string
          promotion_level: string
          reservation_days: string | null
          reserved_user_id: string | null
          seller_id: string
          shipping_options: Json
          specifications: Json | null
          sub_subcategory: string | null
          subcategory: string | null
          title: string
          updated_at: string | null
          variations: Json | null
          view_count: number
          weight: string | null
        }
        Insert: {
          bulk_quantity?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          image_urls?: string[] | null
          is_bulk_listing?: boolean | null
          latitude?: number | null
          like_count?: number
          location: string
          longitude?: number | null
          order_id?: string | null
          price: string
          product_status?: string
          promotion_level?: string
          reservation_days?: string | null
          reserved_user_id?: string | null
          seller_id: string
          shipping_options?: Json
          specifications?: Json | null
          sub_subcategory?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          variations?: Json | null
          view_count?: number
          weight?: string | null
        }
        Update: {
          bulk_quantity?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_urls?: string[] | null
          is_bulk_listing?: boolean | null
          latitude?: number | null
          like_count?: number
          location?: string
          longitude?: number | null
          order_id?: string | null
          price?: string
          product_status?: string
          promotion_level?: string
          reservation_days?: string | null
          reserved_user_id?: string | null
          seller_id?: string
          shipping_options?: Json
          specifications?: Json | null
          sub_subcategory?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          variations?: Json | null
          view_count?: number
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_seller_id"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_tracking"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned: boolean | null
          bio: string | null
          created_at: string
          currency: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          username: string | null
          website: string | null
          currency: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          currency?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          currency?: string | null
        }
        Relationships: []
      }
      seller_accounts: {
        Row: {
          account_status: string | null
          charges_enabled: boolean | null
          created_at: string | null
          id: string
          payout_enabled: boolean | null
          stripe_account_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_status?: string | null
          charges_enabled?: boolean | null
          created_at?: string | null
          id?: string
          payout_enabled?: boolean | null
          stripe_account_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_status?: string | null
          charges_enabled?: boolean | null
          created_at?: string | null
          id?: string
          payout_enabled?: boolean | null
          stripe_account_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_admin: string | null
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_admin?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_admin?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      order_tracking: {
        Row: {
          buyer_id: string | null
          buyer_name: string | null
          current_stage: string | null
          delivery_details: Json | null
          display_order: number | null
          estimated_delivery: string | null
          last_status_change: string | null
          order_date: string | null
          order_id: string | null
          product_id: string | null
          product_images: string[] | null
          product_title: string | null
          seller_id: string | null
          seller_name: string | null
          stage_description: string | null
          stage_name: string | null
          status: string | null
          status_history: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_admin_role: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      create_order: {
        Args: {
          p_product_id: string
          p_buyer_id: string
          p_seller_id: string
          p_amount: number
          p_status: string
          p_delivery_details: Json
        }
        Returns: string
      }
      get_delivery_route_by_date_time: {
        Args: {
          p_date: string
          p_time_slot: string
        }
        Returns: {
          created_at: string
          date: string
          delivery_route: Json | null
          id: string
          pickup_route: Json | null
          status: string | null
          time_slot: string
          updated_at: string | null
        }[]
      }
      get_driver_delivery_stats: {
        Args: {
          driver_id: string
        }
        Returns: Json
      }
      get_next_delivery_stage: {
        Args: {
          p_current_stage: string
        }
        Returns: string
      }
      get_recent_delivery_routes: {
        Args: {
          limit_count?: number
        }
        Returns: {
          created_at: string
          date: string
          delivery_route: Json | null
          id: string
          pickup_route: Json | null
          status: string | null
          time_slot: string
          updated_at: string | null
        }[]
      }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_uuid?: string
            }
            Returns: boolean
          }
      update_order_status: {
        Args: {
          p_order_id: string
          p_status: string
          p_notes?: string
          p_location_lat?: number
          p_location_lng?: number
        }
        Returns: string
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "user" | "admin" | "driver"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
