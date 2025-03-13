
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";

/**
 * Search for products based on query text
 * @param query Search query text
 * @param limit Maximum number of results to return
 * @param category Optional category to filter by
 * @returns Array of matching products
 */
export const searchProducts = async (
  query: string, 
  limit = 10, 
  category?: string
): Promise<ProductType[]> => {
  if (!query && !category) {
    return [];
  }

  try {
    let searchQuery = supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .order('like_count', { ascending: false })
      .limit(limit);

    // Apply category filter if provided
    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }

    // Apply text search if provided
    if (query && query.trim() !== '') {
      // Split the query into words for better search
      const terms = query.trim().split(/\s+/).filter(Boolean);
      
      // If valid terms exist, add them to the search
      if (terms.length > 0) {
        searchQuery = searchQuery.or(
          terms.map(term => `title.ilike.%${term}%`).join(',') + ',' +
          terms.map(term => `description.ilike.%${term}%`).join(',')
        );
      }
    }

    const { data, error } = await searchQuery;

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

/**
 * Search for products within a specific category
 * @param category Category to search in
 * @param limit Maximum number of results to return
 * @returns Array of matching products
 */
export const searchByCategory = async (
  category: string,
  limit = 20
): Promise<ProductType[]> => {
  if (!category) {
    return [];
  }

  try {
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
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching products by category:', error);
      return [];
    }

    return data.map(item => convertToProductType(item));
  } catch (err) {
    console.error('Error in category search function:', err);
    return [];
  }
};
