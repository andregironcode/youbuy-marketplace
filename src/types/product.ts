
export interface ProductType {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  location: string;
  timeAgo: string;
  isNew?: boolean;
  seller: {
    id: string;
    name: string;
    avatar: string;
    joinedDate: string;
  };
  category: string;
}
