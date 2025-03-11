
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";

/**
 * Search for products based on query text
 * @param query Search query text
 * @param limit Maximum number of results to return
 * @returns Array of matching products
 */
export const searchProducts = async (query: string, limit = 10): Promise<ProductType[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    // Split the query into words for better search
    const terms = query.trim().split(/\s+/).filter(Boolean);
    
    // If no valid terms, return empty array
    if (terms.length === 0) {
      return [];
    }

    // Create a search condition that looks for any of the terms in title or description
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .or(
        terms.map(term => `title.ilike.%${term}%`).join(',') + ',' +
        terms.map(term => `description.ilike.%${term}%`).join(',')
      )
      .order('like_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data.map(item => convertToProductType(item));
  } catch (err) {
    console.error('Error in search function:', err);
    return [];
  }
};

/**
 * Get category suggestions based on a search term
 * @param query Search query
 * @returns Array of category suggestions
 */
export const getCategorySuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .ilike('category', `%${query}%`)
      .order('category')
      .limit(5);

    if (error) {
      console.error('Error getting category suggestions:', error);
      return [];
    }

    // Return unique categories
    return [...new Set(data.map(item => item.category))];
  } catch (err) {
    console.error('Error in category suggestions function:', err);
    return [];
  }
};
