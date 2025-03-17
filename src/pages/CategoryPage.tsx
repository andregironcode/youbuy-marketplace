import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
import { categories } from "@/data/categories";
import { ProductType } from "@/types/product";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { convertToProductType } from "@/types/product";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { Button } from "@/components/ui/button";

const CategoryPage = () => {
  const { categoryId, subcategoryId, subSubcategoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");

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

  const currentCategory = categories.find(c => c.id === categoryId);
  let currentSubcategory;
  let currentSubSubcategory;
  
  if (currentCategory && subcategoryId) {
    currentSubcategory = currentCategory.subCategories.find(sc => sc.id === subcategoryId);
    
    if (currentSubcategory && subSubcategoryId && currentSubcategory.subSubCategories) {
      currentSubSubcategory = currentSubcategory.subSubCategories.find(ssc => ssc.id === subSubcategoryId);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CategoryBrowser 
        open={showCategories} 
        onOpenChange={setShowCategories} 
        onSelectCategory={handleCategorySelect} 
      />
      
      <main className="flex-1 container py-8">
        <div className="mb-4">
          <Link to="/categories" className="inline-flex items-center text-sm text-muted-foreground hover:text-youbuy mb-2">
            <ArrowLeft className="mr-1 h-3 w-3" /> Back to all categories
          </Link>
          <h1 className="text-3xl font-bold">{getCategoryName()}</h1>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? 'item' : 'items'} available
          </p>
        </div>
        
        {currentCategory && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentCategory.subCategories.slice(0, 6).map((subcat) => (
              <Button
                key={subcat.id}
                variant={subcategoryId === subcat.id ? "default" : "outline"}
                size="sm"
                onClick={() => navigate(`/category/${categoryId}/${subcat.id}`)}
                className={subcategoryId === subcat.id ? "bg-youbuy hover:bg-youbuy-dark" : ""}
              >
                {subcat.name}
              </Button>
            ))}
          </div>
        )}
        
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
