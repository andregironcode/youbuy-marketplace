export type NotificationType = 
  | 'message'  // Standard message notification
  | 'alert'    // Alert notification
  | 'system';  // System message or announcement

export interface NotificationData {
  id: string;
  created_at: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string; // Database field is 'description', not 'message'
  read: boolean;
  action_url?: string; // Matches database column name
  related_id?: string; // Required by database schema
  metadata?: {
    product_id?: string;
    seller_id?: string;
    chat_id?: string;
    image_url?: string;
    price?: string;
    [key: string]: any;
  };
} 