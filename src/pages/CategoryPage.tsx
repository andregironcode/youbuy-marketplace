import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { categories } from "@/data/categories";
import { ProductType } from "@/types/product";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { convertToProductType } from "@/types/product";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";

const CategoryPage = () => {
  const { categoryId, subcategoryId, subSubcategoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");

  // Listen for the toggleCategories event from Navbar
  useEffect(() => {
    const handleToggleCategories = () => {
      console.log("Toggle categories event received in CategoryPage");
      setShowCategories(prev => !prev);
    };

    window.addEventListener('toggleCategories', handleToggleCategories);
    
    return () => {
      window.removeEventListener('toggleCategories', handleToggleCategories);
    };
  }, []);

  useEffect(() => {
    // Update selected category when URL params change
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id(
              id,
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });
          
        // Add filters based on category parameters
        if (categoryId && categoryId !== "all") {
          query = query.eq('category', categoryId);
          
          if (subcategoryId) {
            query = query.eq('subcategory', subcategoryId);
            
            if (subSubcategoryId) {
              query = query.eq('sub_subcategory', subSubcategoryId);
            }
          }
        }
        
        const { data, error } = await query.limit(50);
        
        if (error) throw error;
        
        if (data) {
          const mappedProducts = data.map(item => convertToProductType(item));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryId, subcategoryId, subSubcategoryId]);

  const getCategoryName = () => {
    if (!categoryId || categoryId === "all") return "All Categories";
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return categoryId;
    
    if (subcategoryId) {
      const subcategory = category.subCategories.find(s => s.id === subcategoryId);
      if (!subcategory) return category.name;
      
      if (subSubcategoryId && subcategory.subSubCategories) {
        const subSubcategory = subcategory.subSubCategories.find(ss => ss.id === subSubcategoryId);
        if (subSubcategory) return subSubcategory.name;
      }
      
      return subcategory.name;
    }
    
    return category.name;
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
  };

  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    // Use the navigate function instead of directly modifying window.location
    if (categoryId === "all") {
      navigate("/");
    } else if (subcategoryId) {
      if (subSubcategoryId) {
        navigate(`/category/${categoryId}/${subcategoryId}/${subSubcategoryId}`);
      } else {
        navigate(`/category/${categoryId}/${subcategoryId}`);
      }
    } else {
      navigate(`/category/${categoryId}`);
    }
    
    setShowCategories(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CategoryBrowser 
        open={showCategories} 
        onOpenChange={setShowCategories} 
        onSelectCategory={handleCategorySelect} 
      />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{getCategoryName()}</h1>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? 'item' : 'items'} available
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
            <p className="mt-4 text-muted-foreground">Loading products...</p>
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
              <div className="text-center py-12 bg-muted/30 rounded-lg border">
                <p className="text-xl font-medium mb-2">No products found</p>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any products in this category
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
