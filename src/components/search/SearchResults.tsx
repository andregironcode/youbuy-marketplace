
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchProducts, getCategorySuggestions } from "@/utils/searchUtils";
import { ProductType } from "@/types/product";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  query: string;
  onSelectResult?: () => void;
}

export const SearchResults = ({ query, onSelectResult }: SearchResultsProps) => {
  const [results, setResults] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setCategories([]);
        return;
      }

      setLoading(true);
      try {
        const [productResults, categoryResults] = await Promise.all([
          searchProducts(query, 5),
          getCategorySuggestions(query)
        ]);
        
        setResults(productResults);
        setCategories(categoryResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearchAll = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    if (onSelectResult) onSelectResult();
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${encodeURIComponent(category)}`);
    if (onSelectResult) onSelectResult();
  };

  const handleResultClick = () => {
    if (onSelectResult) onSelectResult();
  };

  if (query.trim().length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[70vh] overflow-y-auto z-50">
      {loading ? (
        <div className="p-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Searching...</p>
        </div>
      ) : (
        <div className="divide-y">
          {categories.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className="w-full justify-start text-sm h-auto py-2"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <SearchIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{query} in <span className="font-semibold">{category}</span></span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">Products</h3>
              <div className="space-y-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
                    onClick={handleResultClick}
                  >
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-sm font-semibold text-youbuy">AED {product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && categories.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}

          <div className="p-2">
            <Button 
              onClick={handleSearchAll}
              variant="ghost" 
              className="w-full justify-center text-sm"
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Search for "{query}"
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
