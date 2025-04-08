import { ProductType } from "./product";

export interface MessageType {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  sender_name?: string;
  sender_avatar?: string | null;
}

export interface ChatType {
  id: string;
  created_at: string;
  last_message_at: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  unread_count: number;
  last_message?: {
    id: string;
    content: string;
    created_at: string;
    read: boolean;
  };
  product: {
    id: string;
    title: string;
    price: string;
    image_urls: string[] | null;
    product_status: "available" | "reserved" | "sold";
  };
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    last_seen?: string | null;
  };
}

export type ProductStatus = "available" | "reserved" | "sold";
