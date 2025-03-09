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
  isPromoted?: boolean; // New field for promoted listings
  promotionEndDate?: string; // When promotion ends
  promotionLevel?: 'basic' | 'premium' | 'featured'; // Different promotion tiers
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
  subcategory?: string; // Added explicit subcategory field
  subSubcategory?: string; // Added explicit sub-subcategory field
  // New fields for enhanced product listings
  variations?: ProductVariation[];
  status?: 'available' | 'reserved' | 'sold';
  reservedFor?: string; // User ID if reserved for a specific user
  reservedUntil?: string; // ISO date string until when the product is reserved
  specifications?: ProductSpecifications; // New field for category-specific attributes
  weight?: string; // Weight range for shipping
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingOptions?: {
    inPersonMeetup: boolean;
    platformShipping: boolean; // Changed from 'shipping' to 'platformShipping'
    shippingCost?: number;
  };
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

// New interface for category-specific specifications
export interface ProductSpecifications {
  // General
  condition?: 'new' | 'like-new' | 'excellent' | 'good' | 'fair' | 'salvage';
  
  // Electronics
  brand?: string;
  model?: string;
  
  // Televisions
  screenSize?: number; // in inches
  resolution?: 'hd' | 'fullhd' | '4k' | '8k';
  smartTv?: 'none' | 'basic' | 'full';
  
  // Mobile Phones & Tablets
  storage?: string; // e.g., "128GB"
  processor?: string;
  ram?: string;
  camera?: string;
  
  // Computers & Laptops
  computerType?: 'desktop' | 'laptop' | 'tablet' | 'all-in-one';
  graphics?: string;
  operatingSystem?: string;
  
  // Furniture
  material?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Others - extensible with additional attributes as needed
  [key: string]: any;
}
