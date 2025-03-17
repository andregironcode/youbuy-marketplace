
import { ProductType } from "@/types/product";

export const products: ProductType[] = [
  {
    id: "1",
    title: "iPhone 13 Pro Max - 256GB",
    description: "Excellent condition iPhone 13 Pro Max with 256GB storage. Comes with original charger and box. No scratches or dents.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    images: [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f"
    ],
    location: "Dubai Marina",
    coordinates: {
      latitude: 25.0819,
      longitude: 55.1443
    },
    timeAgo: "2 days ago",
    isNew: true,
    isFeatured: true,
    createdAt: "2023-10-29T14:00:00Z",
    seller: {
      id: "user1",
      name: "Ahmed",
      avatar: "https://i.pravatar.cc/150?img=1",
      joinedDate: "Jan 2022",
      userId: "00000000-0000-0000-0000-000000000001",
      rating: 4.7,
      totalReviews: 23
    },
    category: "electronics"
  },
  {
    id: "2",
    title: "Ikea MALM Desk - White",
    description: "White IKEA MALM desk in good condition. Dimensions: 140x65 cm. Can deliver within Dubai for additional fee.",
    price: 250,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
      "https://images.unsplash.com/photo-1505699261378-c431c8e25576"
    ],
    location: "JLT",
    coordinates: {
      latitude: 25.0683,
      longitude: 55.1401
    },
    timeAgo: "1 week ago",
    createdAt: "2023-10-22T09:30:00Z",
    seller: {
      id: "user2",
      name: "Sarah",
      avatar: "https://i.pravatar.cc/150?img=5",
      joinedDate: "Mar 2021",
      userId: "00000000-0000-0000-0000-000000000002",
      rating: 4.2,
      totalReviews: 9
    },
    category: "furniture"
  },
  {
    id: "3",
    title: "MacBook Pro 16\" M1 Pro",
    description: "2021 MacBook Pro with M1 Pro chip, 16GB RAM and 512GB SSD. Barely used, in perfect condition with AppleCare+ until 2024.",
    price: 7500,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    images: [
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca6",
      "https://images.unsplash.com/photo-1496181133206-ae15ff5dd4ea",
      "https://images.unsplash.com/photo-1526570207772-784d36084510"
    ],
    location: "Downtown Dubai",
    coordinates: {
      latitude: 25.1915,
      longitude: 55.2747
    },
    timeAgo: "3 days ago",
    isNew: true,
    isFeatured: true,
    createdAt: "2023-10-27T11:15:00Z",
    seller: {
      id: "user3",
      name: "Michael",
      avatar: "https://i.pravatar.cc/150?img=8",
      joinedDate: "Dec 2021",
      userId: "00000000-0000-0000-0000-000000000003",
      rating: 5.0,
      totalReviews: 12
    },
    category: "electronics"
  },
  {
    id: "4",
    title: "Canon EOS R5 Camera with 24-70mm Lens",
    description: "Canon EOS R5 45MP mirrorless camera with 24-70mm f/2.8 L lens. Includes extra battery, 128GB card, and camera bag.",
    price: 12000,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    images: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      "https://images.unsplash.com/photo-1516961642265-531546e84af2",
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea"
    ],
    location: "Abu Dhabi",
    coordinates: {
      latitude: 24.4539,
      longitude: 54.3773
    },
    timeAgo: "4 days ago",
    createdAt: "2023-10-26T16:45:00Z",
    isFeatured: true,
    seller: {
      id: "user4",
      name: "Fatima",
      avatar: "https://i.pravatar.cc/150?img=9",
      joinedDate: "Aug 2020",
      userId: "00000000-0000-0000-0000-000000000004",
      rating: 4.5,
      totalReviews: 17
    },
    category: "electronics"
  },
  {
    id: "5",
    title: "Sony PlayStation 5 Digital Edition",
    description: "Brand new PS5 Digital Edition, unopened. Includes controller and all original accessories.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    images: [
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3"
    ],
    location: "Sharjah",
    coordinates: {
      latitude: 25.3463,
      longitude: 55.4209
    },
    timeAgo: "1 day ago",
    isNew: true,
    createdAt: "2023-10-30T08:20:00Z",
    seller: {
      id: "user5",
      name: "Omar",
      avatar: "https://i.pravatar.cc/150?img=3",
      joinedDate: "Feb 2023",
      userId: "00000000-0000-0000-0000-000000000005",
      rating: 3.8,
      totalReviews: 5
    },
    category: "electronics"
  },
  {
    id: "6",
    title: "Nike Air Jordan 1 High - Size 43",
    description: "Nike Air Jordan 1 High in University Blue colorway. Size 43 EU / 9.5 US. Worn only twice, like new condition.",
    price: 850,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    images: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3",
      "https://images.unsplash.com/photo-1542219550-2da9a6bc0b8d"
    ],
    location: "Dubai Sports City",
    coordinates: {
      latitude: 25.0324,
      longitude: 55.2252
    },
    timeAgo: "5 days ago",
    createdAt: "2023-10-25T13:10:00Z",
    seller: {
      id: "user6",
      name: "Jason",
      avatar: "https://i.pravatar.cc/150?img=4",
      joinedDate: "Apr 2022",
      userId: "00000000-0000-0000-0000-000000000006",
      rating: 4.9,
      totalReviews: 15
    },
    category: "clothing"
  }
];

// Add the missing getProductById function
export const getProductById = (id: string): ProductType | undefined => {
  return products.find(product => product.id === id);
};
