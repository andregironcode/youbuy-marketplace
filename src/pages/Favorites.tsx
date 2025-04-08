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

  // Redirect to login if not authenticated, or to profile/favorites if authenticated
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else {
        // Redirect to the profile/favorites route for consistency
        navigate("/profile/favorites", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // This component will only show briefly during loading or redirect
  return <div className="h-screen flex items-center justify-center">Redirecting...</div>;
};

export default Favorites;
