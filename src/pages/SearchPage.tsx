
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { searchProducts } from "@/utils/searchUtils";
import { ProductType } from "@/types/product";
import { Loader2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !category) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchProducts(query, 50, category);
        setProducts(results);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category]);

  const getSearchTitle = () => {
    if (category && query) {
      return `"${query}" in ${category}`;
    } else if (category) {
      return category;
    } else if (query) {
      return `"${query}"`;
    } else {
      return "All Products";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Search Results</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              {products.length > 0
                ? `Showing ${products.length} results for ${getSearchTitle()}`
                : `No results found for ${getSearchTitle()}`}
            </p>
            {category && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {category}
              </Badge>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
            <p className="mt-4 text-muted-foreground">Searching for products...</p>
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
                  {category 
                    ? `We couldn't find any products matching "${query}" in the "${category}" category` 
                    : `We couldn't find any products matching "${query}"`}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
