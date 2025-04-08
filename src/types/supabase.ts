export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned: boolean | null
          bio: string | null
          created_at: string
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
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          currency?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 