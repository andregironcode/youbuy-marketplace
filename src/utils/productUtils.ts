
import { supabase } from "@/integrations/supabase/client";
import { SellFormData } from "@/types/sellForm";

export const publishProduct = async (formData: SellFormData, userId: string, uploadedImageUrls: string[]) => {
  const productData = {
    title: formData.title,
    price: formData.price,
    description: formData.description,
    location: formData.location,
    latitude: formData.coordinates?.latitude,
    longitude: formData.coordinates?.longitude,
    category: formData.category,
    subcategory: formData.subcategory,
    sub_subcategory: formData.subSubcategory,
    image_urls: uploadedImageUrls,
    variations: formData.variations,
    specifications: formData.specifications,
    product_status: formData.productStatus,
    reserved_user_id: formData.reservedUserId || null,
    reservation_days: formData.reservationDays,
    is_bulk_listing: formData.isBulkListing,
    bulk_quantity: formData.bulkQuantity,
    weight: formData.weight,
    shipping_options: formData.shippingOptions,
    promotion_level: formData.promotionLevel,
    seller_id: userId
  };
  
  const { error, data } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();
    
  if (error) {
    console.error('Error inserting product:', error);
    throw new Error(`Failed to add product: ${error.message}`);
  }
  
  return data;
};

export const updatePromotionLevel = async (title: string, sellerId: string, promotionLevel: string) => {
  const { error } = await supabase
    .from('products')
    .update({ promotion_level: promotionLevel })
    .eq('title', title)
    .eq('seller_id', sellerId);
    
  if (error) {
    console.error('Error updating promotion:', error);
    throw new Error(`Failed to update promotion: ${error.message}`);
  }
};
