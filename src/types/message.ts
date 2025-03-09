
export interface MessageType {
  id: string;
  senderId: string;
  receiverId: string;
  productId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ChatType {
  id: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  lastMessageAt: string;
  createdAt: string;
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
