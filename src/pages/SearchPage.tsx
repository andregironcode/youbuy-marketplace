
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { searchProducts } from "@/utils/searchUtils";
import { ProductType } from "@/types/product";
import { Loader2 } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchProducts(query, 50);
        setProducts(results);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">
            {products.length > 0
              ? `Showing ${products.length} results for "${query}"`
              : `No results found for "${query}"`}
          </p>
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
                  We couldn't find any products matching "{query}"
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
