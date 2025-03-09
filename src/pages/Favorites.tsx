
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { favorites, loadingFavorites } = useFavorites();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Filter products to show only favorites
  const favoriteProducts = products.filter(product => 
    favorites?.includes(product.id)
  );

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <ProfileSidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Your favorites</h1>
            <p className="text-muted-foreground">
              All your saved items in one place. Keep track of products you're interested in.
            </p>
          </div>

          {loadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="rounded-lg border shadow animate-pulse bg-gray-100 h-64"></div>
              ))}
            </div>
          ) : favoriteProducts.length > 0 ? (
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
              <button 
                onClick={() => navigate('/')}
                className="bg-youbuy hover:bg-youbuy-dark text-white px-4 py-2 rounded-full"
              >
                Discover products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
