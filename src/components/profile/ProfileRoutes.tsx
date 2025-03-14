
import { Routes, Route, Navigate } from "react-router-dom";
import { ProductsPage } from "./pages/ProductsPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { SalesPage } from "./pages/SalesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { InboxPage, FavoritesRedirect } from "./pages/RedirectPages";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { StatsOverview } from "@/components/stats/StatsOverview";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { useCategoryToggle } from "@/hooks/useCategoryToggle";
import { useNavigate } from "react-router-dom";
import { PremiumPage } from "./pages/PremiumPage";
import { WalletPage } from "./pages/WalletPage";
import { useAuth } from "@/context/AuthContext";

export const ProfileRoutes = () => {
  const { showCategories, setShowCategories } = useCategoryToggle();
  const navigate = useNavigate();
  
  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
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
    <>
      <CategoryBrowser 
        open={showCategories} 
        onOpenChange={setShowCategories} 
        onSelectCategory={handleCategorySelect} 
      />
      
      <Routes>
        <Route path="/" element={<Navigate to="/profile/products" replace />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="favorites" element={<FavoritesRedirect />} />
        <Route path="stats" element={<StatsOverview />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Routes>
    </>
  );
};
