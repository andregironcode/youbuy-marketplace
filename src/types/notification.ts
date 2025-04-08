export type NotificationType = 
  | 'product_purchased'  // Someone bought your product
  | 'product_favorited'  // Someone favorited your product
  | 'seller_new_product' // A seller you follow listed a new product
  | 'message_received'   // New message received
  | 'product_sold'       // Your product was sold
  | 'product_reserved'   // Your product was reserved
  | 'system_message';    // System message or announcement

export interface NotificationData {
  id: string;
  created_at: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: {
    product_id?: string;
    seller_id?: string;
    chat_id?: string;
    image_url?: string;
    price?: string;
    [key: string]: any;
  };
} 