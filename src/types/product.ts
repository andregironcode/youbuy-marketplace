
export interface ProductType {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location: string;
  timeAgo: string;
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: string; // ISO date string
  seller: {
    id: string;
    name: string;
    avatar: string;
    joinedDate: string;
  };
  category: string;
}
