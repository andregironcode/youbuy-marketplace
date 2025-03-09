
export interface ProductType {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Added support for multiple images
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
    rating?: number; // Average seller rating
    totalReviews?: number; // Total number of reviews
    totalListings?: number; // Total published listings
    totalSales?: number; // Total completed sales
    totalPurchases?: number; // Total purchases made
    totalShipments?: number; // Total shipments completed
    businessAccount?: boolean; // Whether this is a business account
  };
  category: string;
  // New fields for enhanced product listings
  variations?: ProductVariation[];
  status?: 'available' | 'reserved' | 'sold';
  reservedFor?: string; // User ID if reserved for a specific user
  reservedUntil?: string; // ISO date string until when the product is reserved
}

export interface ProductVariation {
  id: string;
  type: 'color' | 'size' | 'style' | 'material' | 'custom';
  name: string; // For custom variation types
  options: ProductVariationOption[];
  required?: boolean;
}

export interface ProductVariationOption {
  id: string;
  value: string;
  image?: string;
  additionalPrice?: number; // Extra cost for this option, if any
  available: boolean; // Whether this option is in stock
  stockQuantity?: number; // Optional stock count
}
