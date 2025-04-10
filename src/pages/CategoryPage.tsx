import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/search/SearchBar";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryFilter } from "@/components/category/CategoryFilter";
import { SortFilter } from "@/components/filters/SortFilter";
import { DistanceFilter } from "@/components/filters/DistanceFilter";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { calculateDistance } from "@/utils/locationUtils";
import { useSearchParams } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryId, subcategoryId, subSubcategoryId } = useParams<{ categoryId?: string; subcategoryId?: string; subSubcategoryId?: string }>();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 20;
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('products')
      .select('*, profiles:seller_id(*)', { count: 'exact' })
      .eq('category', categoryId);

    if (subcategoryId) {
      query = query.eq('subcategory', subcategoryId);
    }

    if (subSubcategoryId) {
      query = query.eq('sub_subcategory', subSubcategoryId);
    }

    if (debouncedSearchTerm) {
      query = query.ilike('title', `%${debouncedSearchTerm}%`);
    }

    if (priceRange.min !== null) {
      query = query.gte('price', priceRange.min);
    }

    if (priceRange.max !== null) {
      query = query.lte('price', priceRange.max);
    }

    // Get total count first
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', categoryId)
      .eq('subcategory', subcategoryId || '')
      .eq('sub_subcategory', subSubcategoryId || '');

    // Apply sorting
    if (sortOrder === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sortOrder === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false });
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    query = query.range(startIndex, startIndex + productsPerPage - 1);

    try {
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } else {
        let convertedProducts = data.map((item: any) => convertToProductType(item));
        
        // Apply distance filter if needed
        if (maxDistance && userLocation) {
          convertedProducts = convertedProducts.filter(product => {
            const distance = calculateProductDistance(product);
            return distance !== null && distance <= maxDistance;
          });
        }
        
        setProducts(convertedProducts);
        setTotalPages(Math.ceil((count || 0) / productsPerPage));
      }
    } catch (error: any) {
      console.error('Unexpected error fetching products:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [categoryId, subcategoryId, subSubcategoryId, debouncedSearchTerm, sortOrder, priceRange, currentPage, maxDistance, userLocation]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, subcategoryId, subSubcategoryId, debouncedSearchTerm, sortOrder, priceRange]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCategoryChange = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    const categoryPath = `/category/${categoryId}${subcategoryId ? `/${subcategoryId}` : ''}${subSubcategoryId ? `/${subSubcategoryId}` : ''}`;
    navigate(categoryPath);
  };

  const handleSortChange = (newSortOrder: string) => {
    setSortOrder(newSortOrder);
  };

  const handleDistanceChange = (newMaxDistance: number | null) => {
    setMaxDistance(newMaxDistance);
  };

  const handlePriceRangeChange = (newPriceRange: { min: number | null; max: number | null }) => {
    setPriceRange(newPriceRange);
  };

  // Inside the component where location filtering is applied
  const calculateProductDistance = (product: ProductType) => {
    if (!userLocation || !product.coordinates) return null;
    
    // Using the coordinates from the product type
    const productLat = product.coordinates.latitude;
    const productLng = product.coordinates.longitude;
    
    if (!productLat || !productLng) return null;
    
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      productLat,
      productLng
    );
  };

  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    if (maxDistance && userLocation) {
      filtered = products.filter(product => {
        const distance = calculateProductDistance(product);
        return distance !== null && distance <= maxDistance;
      });
    }

    return filtered;
  }, [products, maxDistance, userLocation]);

  // Custom Pagination component that uses the shadcn Pagination components
  const CustomPagination = ({ currentPage, totalPages, onPageChange }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void 
  }) => {
    const pages = [...Array(Math.min(5, totalPages))].map((_, i) => {
      let pageNum = i + 1;
      if (totalPages > 5) {
        if (currentPage > 3 && currentPage <= totalPages - 2) {
          pageNum = currentPage - 2 + i;
        } else if (currentPage > totalPages - 2) {
          pageNum = totalPages - 4 + i;
        }
      }
      return pageNum;
    });

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
            </PaginationItem>
          )}
          
          {totalPages > 5 && currentPage > 3 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="flex h-9 w-9 items-center justify-center">...</span>
              </PaginationItem>
            </>
          )}
          
          {pages.map(page => (
            <PaginationItem key={page}>
              <PaginationLink 
                isActive={page === currentPage} 
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <PaginationItem>
                <span className="flex h-9 w-9 items-center justify-center">...</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <SearchBar className="w-full" placeholder="Search in this category..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="md:col-span-1">
          <CategoryFilter
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            subSubcategoryId={subSubcategoryId}
            onCategoryChange={handleCategoryChange}
          />
          <PriceRangeFilter onPriceRangeChange={handlePriceRangeChange} />
          <DistanceFilter onDistanceChange={handleDistanceChange} />
          <SortFilter sortOrder={sortOrder} onSortChange={handleSortChange} />
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-40 w-full rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-gray-500">No products found in this category.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
