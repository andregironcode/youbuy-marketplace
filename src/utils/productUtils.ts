
import { supabase } from "@/integrations/supabase/client";
import { SellFormData } from "@/types/sellForm";

/**
 * Publishes a new product to the marketplace
 * @param formData - The product details from the sell form
 * @param userId - The ID of the seller
 * @param uploadedImageUrls - Array of uploaded image URLs
 * @returns The created product data
 */
export const publishProduct = async (formData: SellFormData, userId: string, uploadedImageUrls: string[]) => {
  try {
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
  } catch (error) {
    console.error('Error in publishProduct:', error);
    throw error;
  }
};

/**
 * Updates the promotion level of a product
 * @param title - Product title
 * @param sellerId - Seller ID
 * @param promotionLevel - New promotion level
 */
export const updatePromotionLevel = async (title: string, sellerId: string, promotionLevel: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ promotion_level: promotionLevel })
      .eq('title', title)
      .eq('seller_id', sellerId);
      
    if (error) {
      console.error('Error updating promotion:', error);
      throw new Error(`Failed to update promotion: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updatePromotionLevel:', error);
    throw error;
  }
};

/**
 * Fetches a product by ID with error handling
 * @param productId - The product ID to fetch
 * @returns The product data or null if not found
 */
export const fetchProductById = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles:seller_id(*)')
      .eq('id', productId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    throw error;
  }
};
