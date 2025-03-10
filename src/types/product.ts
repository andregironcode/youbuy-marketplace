
export interface ProductType {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timeAgo: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isPromoted?: boolean;
  promotionEndDate?: string;
  promotionLevel?: 'basic' | 'premium' | 'featured';
  createdAt: string;
  viewCount?: number;
  likeCount?: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    joinedDate: string;
    userId?: string;
    rating?: number;
    totalReviews?: number;
    totalListings?: number;
    totalSales?: number;
    totalPurchases?: number;
    totalShipments?: number;
    businessAccount?: boolean;
  };
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  variations?: ProductVariation[];
  status?: 'available' | 'reserved' | 'sold';
  reservedFor?: string;
  reservedUntil?: string;
  specifications?: ProductSpecifications;
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingOptions?: {
    inPersonMeetup: boolean;
    platformShipping: boolean;
    shippingCost?: number;
  };
}

export interface ProductVariation {
  id: string;
  type: 'color' | 'size' | 'style' | 'material' | 'custom';
  name: string;
  options: ProductVariationOption[];
  required?: boolean;
}

export interface ProductVariationOption {
  id: string;
  value: string;
  image?: string;
  additionalPrice?: number;
  available: boolean;
  stockQuantity?: number;
}

export interface ProductSpecifications {
  condition?: 'new' | 'like-new' | 'excellent' | 'good' | 'fair' | 'salvage';
  
  brand?: string;
  model?: string;
  
  screenSize?: number;
  resolution?: 'hd' | 'fullhd' | '4k' | '8k';
  smartTv?: 'none' | 'basic' | 'full';
  
  storage?: string;
  processor?: string;
  ram?: string;
  camera?: string;
  
  computerType?: 'desktop' | 'laptop' | 'tablet' | 'all-in-one';
  graphics?: string;
  operatingSystem?: string;
  
  material?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  [key: string]: any;
}

// Import formatDistance from date-fns
import { formatDistance } from "date-fns";

export function convertToProductType(item: any, includeViews = false): ProductType {
  const profileData = item.profiles && typeof item.profiles === 'object' ? item.profiles : null;
  
  // Make sure we extract the seller ID correctly
  const sellerId = profileData?.id || item.seller_id;
  
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: parseFloat(item.price),
    image: item.image_urls?.[0] || '/placeholder.svg',
    images: item.image_urls || [],
    location: item.location,
    timeAgo: formatDistance(new Date(item.created_at), new Date(), { addSuffix: true }),
    seller: {
      // Ensure seller ID is a string
      id: typeof sellerId === 'string' ? sellerId : String(sellerId),
      name: profileData?.full_name || 'Unknown Seller',
      avatar: profileData?.avatar_url || '/placeholder.svg',
      joinedDate: profileData?.created_at || item.created_at
    },
    category: item.category,
    subcategory: item.subcategory || undefined,
    subSubcategory: item.sub_subcategory || undefined,
    viewCount: includeViews ? (item.view_count || 0) : undefined,
    likeCount: item.like_count || 0,
    createdAt: item.created_at,
    status: item.product_status || 'available',
    variations: item.variations || [],
    specifications: item.specifications || {},
    shippingOptions: {
      inPersonMeetup: item.shipping_options?.inPersonMeetup || true,
      platformShipping: item.shipping_options?.platformShipping || false,
      shippingCost: item.shipping_options?.shippingCost || 0
    }
  };
}
