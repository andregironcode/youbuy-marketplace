import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";
import { calculateDistance, getCurrentPosition } from "@/utils/locationUtils";
import { categories } from "@/data/categories";

interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  distance?: number;
  onlyAvailable?: boolean;
  limit?: number;
  userLocation?: { lat: number; lng: number } | null;
  time?: string;
}

/**
 * Search for products based on query text and filters
 * @param filters Search filters
 * @returns Array of matching products
 */
export const searchProducts = async (
  filters: SearchFilters
): Promise<ProductType[]> => {
  const { 
    query = "", 
    category,
    minPrice,
    maxPrice,
    sortBy = "recent",
    distance,
    onlyAvailable = false,
    limit = 50,
    userLocation = null,
    time
  } = filters;

  // Only return empty array if no filters and no sort is applied
  if (!query && !category && !minPrice && !maxPrice && !onlyAvailable && !sortBy) {
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
      .limit(limit);

    // Apply time filter if provided
    if (time) {
      const now = new Date();
      let timeFilter;
      
      switch (time) {
        case "24h":
          timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
      }
      
      searchQuery = searchQuery.gte('created_at', timeFilter.toISOString());
    }

    // Apply category filter if provided
    if (category) {
      searchQuery = searchQuery.eq('category_id', category);
    }

    // Apply price filters if provided
    if (minPrice !== undefined && minPrice !== null) {
      searchQuery = searchQuery.gte('price', minPrice);
    }
    
    if (maxPrice !== undefined && maxPrice !== null) {
      searchQuery = searchQuery.lte('price', maxPrice);
    }
    
    // Apply availability filter
    if (onlyAvailable) {
      searchQuery = searchQuery.eq('product_status', 'available');
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

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        searchQuery = searchQuery.order('price', { ascending: true });
        break;
      case "price_desc":
        searchQuery = searchQuery.order('price', { ascending: false });
        break;
      case "popular":
        searchQuery = searchQuery.order('like_count', { ascending: false });
        break;
      case "recent":
      default:
        searchQuery = searchQuery.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await searchQuery;

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    // Filter by distance if user location is available
    let filteredData = data;
    
    if (distance && userLocation && userLocation.lat && userLocation.lng) {
      filteredData = filterByDistance(data, distance, userLocation.lat, userLocation.lng);
    }

    return filteredData.map(item => convertToProductType(item));
  } catch (err) {
    console.error('Error in search function:', err);
    return [];
  }
};

/**
 * Get all available categories from the predefined categories list
 * @returns Array of unique categories
 */
export const getAllCategories = async (): Promise<string[]> => {
  try {
    // Return all main category names from the predefined categories
    return categories.map(category => category.name);
  } catch (err) {
    console.error('Error in get categories function:', err);
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

/**
 * Count active filters from search params
 * @param searchParams URL search params
 * @returns Number of active filters
 */
export const countActiveFilters = (searchParams: URLSearchParams): number => {
  let count = 0;
  if (searchParams.get("min_price") || searchParams.get("max_price")) count++;
  if (searchParams.get("sort") && searchParams.get("sort") !== "recent") count++;
  if (searchParams.get("available") === "true") count++;
  if (searchParams.get("distance") && searchParams.get("distance") !== "50") count++;
  return count;
};

/**
 * Get user's location for distance-based filtering
 * @returns Promise resolving to user's location or null if unavailable
 */
export const getUserLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const position = await getCurrentPosition();
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error) {
    console.error("Error getting user location:", error);
    return null;
  }
};

const filterByDistance = (products: any[], maxDistance: number, userLat: number, userLng: number) => {
  if (!maxDistance || maxDistance <= 0 || !userLat || !userLng) {
    return products;
  }

  return products.filter(product => {
    if (!product.latitude || !product.longitude) {
      return false;
    }

    const distance = calculateDistance(
      userLat,
      userLng,
      product.latitude,
      product.longitude
    );

    return distance <= maxDistance;
  });
};
