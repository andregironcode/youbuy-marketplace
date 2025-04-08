import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductType, convertToProductType } from "@/types/product";

export const FavoriteProductsTab = () => {
  const { favorites, loadingFavorites } = useFavorites();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (!favorites || favorites.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch products from the database that match the favorite IDs
        const { data, error } = await supabase
          .from("products")
          .select("*, profiles(*)")
          .in("id", favorites);

        if (error) {
          console.error("Error fetching favorite products:", error);
          setFavoriteProducts([]);
        } else if (data) {
          // Convert the database format to our ProductType format
          const convertedProducts = data.map(item => convertToProductType(item));
          setFavoriteProducts(convertedProducts);
        }
      } catch (err) {
        console.error("Error in favorite products fetch:", err);
        setFavoriteProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingFavorites) {
      fetchFavoriteProducts();
    }
  }, [favorites, loadingFavorites]);

  if (loadingFavorites || loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-lg border shadow animate-pulse bg-gray-100 h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            When you find something you like, click the heart icon to save it to your favorites.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-youbuy hover:bg-youbuy-dark text-white px-4 py-2 rounded-full"
          >
            Discover products
          </Button>
        </div>
      )}
    </div>
  );
};
