
export type SellStep = 
  | "title" 
  | "category" 
  | "details" 
  | "photos" 
  | "shipping" 
  | "location" 
  | "preview" 
  | "promote";

export interface SellFormData {
  title: string;
  price: string;
  description: string;
  location: string;
  category: string;
  subcategory: string;
  subSubcategory: string;
  images: File[];
  imagePreviewUrls: string[];
  variations: any[];
  specifications: any;
  productStatus: 'available' | 'reserved';
  reservedUserId: string;
  reservationDays: string;
  isBulkListing: boolean;
  bulkQuantity: string;
  weight: string;
  shippingOptions: {
    inPersonMeetup: boolean;
    platformShipping: boolean;
    shippingCost: number;
  };
  promotionLevel: 'none' | 'basic' | 'premium' | 'featured';
}
