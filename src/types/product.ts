
export interface ProductType {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timeAgo: string;
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: string; // ISO date string
  seller: {
    id: string;
    name: string;
    avatar: string;
    joinedDate: string;
    userId?: string; // Add userId for authenticated user reference
  };
  category: string;
}
