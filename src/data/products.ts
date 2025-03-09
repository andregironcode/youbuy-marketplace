
import { ProductType } from "@/types/product";

export const products: ProductType[] = [
  {
    id: "1",
    title: "iPhone 13 Pro Max - 256GB",
    description: "Excellent condition iPhone 13 Pro Max with 256GB storage. Comes with original charger and box. No scratches or dents.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    location: "Dubai Marina",
    timeAgo: "2 days ago",
    isNew: true,
    seller: {
      id: "user1",
      name: "Ahmed",
      avatar: "https://i.pravatar.cc/150?img=1",
      joinedDate: "Jan 2022",
    },
    category: "electronics"
  },
  {
    id: "2",
    title: "Ikea MALM Desk - White",
    description: "White IKEA MALM desk in good condition. Dimensions: 140x65 cm. Can deliver within Dubai for additional fee.",
    price: 250,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    location: "JLT",
    timeAgo: "1 week ago",
    seller: {
      id: "user2",
      name: "Sarah",
      avatar: "https://i.pravatar.cc/150?img=5",
      joinedDate: "Mar 2021",
    },
    category: "furniture"
  },
  {
    id: "3",
    title: "MacBook Pro 16\" M1 Pro",
    description: "2021 MacBook Pro with M1 Pro chip, 16GB RAM and 512GB SSD. Barely used, in perfect condition with AppleCare+ until 2024.",
    price: 7500,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    location: "Downtown Dubai",
    timeAgo: "3 days ago",
    isNew: true,
    seller: {
      id: "user3",
      name: "Michael",
      avatar: "https://i.pravatar.cc/150?img=8",
      joinedDate: "Dec 2021",
    },
    category: "electronics"
  },
  {
    id: "4",
    title: "Canon EOS R5 Camera with 24-70mm Lens",
    description: "Canon EOS R5 45MP mirrorless camera with 24-70mm f/2.8 L lens. Includes extra battery, 128GB card, and camera bag.",
    price: 12000,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    location: "Abu Dhabi",
    timeAgo: "4 days ago",
    seller: {
      id: "user4",
      name: "Fatima",
      avatar: "https://i.pravatar.cc/150?img=9",
      joinedDate: "Aug 2020",
    },
    category: "electronics"
  },
  {
    id: "5",
    title: "Sony PlayStation 5 Digital Edition",
    description: "Brand new PS5 Digital Edition, unopened. Includes controller and all original accessories.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    location: "Sharjah",
    timeAgo: "1 day ago",
    isNew: true,
    seller: {
      id: "user5",
      name: "Omar",
      avatar: "https://i.pravatar.cc/150?img=3",
      joinedDate: "Feb 2023",
    },
    category: "electronics"
  },
  {
    id: "6",
    title: "Nike Air Jordan 1 High - Size 43",
    description: "Nike Air Jordan 1 High in University Blue colorway. Size 43 EU / 9.5 US. Worn only twice, like new condition.",
    price: 850,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    location: "Dubai Sports City",
    timeAgo: "5 days ago",
    seller: {
      id: "user6",
      name: "Jason",
      avatar: "https://i.pravatar.cc/150?img=4",
      joinedDate: "Apr 2022",
    },
    category: "clothing"
  }
];
