
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoriteProductsTab } from "@/components/favorites/FavoriteProductsTab";
import { FavoriteSellersTab } from "@/components/favorites/FavoriteSellersTab";
import { Heart, User } from "lucide-react";

const Favorites = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <ProfileSidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Your favorites</h1>
            <p className="text-muted-foreground">
              All your saved items and favorite sellers in one place.
            </p>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="w-full max-w-md mb-6">
              <TabsTrigger value="products" className="flex items-center flex-1">
                <Heart className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="sellers" className="flex items-center flex-1">
                <User className="mr-2 h-4 w-4" />
                Sellers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <FavoriteProductsTab />
            </TabsContent>

            <TabsContent value="sellers">
              <FavoriteSellersTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
