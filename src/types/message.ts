
export interface MessageType {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface ChatType {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  last_message_at: string;
  created_at: string;
  product?: {
    title: string;
    image: string;
    price: number;
  };
  otherUser?: {
    name: string;
    avatar: string;
  };
  lastMessage?: string;
  unreadCount?: number;
}
