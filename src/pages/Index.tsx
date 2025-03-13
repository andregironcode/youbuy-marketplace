import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleToggleCategories = () => {
      console.log("Toggle categories event received in Index");
      setShowCategories(prev => !prev);
    };

    window.addEventListener('toggleCategories', handleToggleCategories);
    
    return () => {
      window.removeEventListener('toggleCategories', handleToggleCategories);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
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
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) {
          console.error('Error fetching products:', error);
          setLoading(false);
          return;
        }
        
        if (data) {
          const mappedProducts = data.map(item => convertToProductType(item));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error in products fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    console.log("Selected category:", categoryId, subcategoryId, subSubcategoryId);
    
    if (categoryId === "all") {
      navigate("/");
    } else if (subSubcategoryId) {
      navigate(`/category/${categoryId}/${subcategoryId}/${subSubcategoryId}`);
    } else if (subcategoryId) {
      navigate(`/category/${categoryId}/${subcategoryId}`);
    } else {
      navigate(`/category/${categoryId}`);
    }
    
    setShowCategories(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8">
        {/* CategoryBrowser component */}
        <CategoryBrowser 
          open={showCategories} 
          onOpenChange={setShowCategories} 
          onSelectCategory={handleCategorySelect} 
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Discover amazing deals nearby</h1>
          <p className="text-muted-foreground">Find items you'll love at prices you'll love even more</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
