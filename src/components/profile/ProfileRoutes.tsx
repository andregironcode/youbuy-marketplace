
import { Routes, Route, Navigate } from "react-router-dom";
import { ProductsPage } from "./pages/ProductsPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { SalesPage } from "./pages/SalesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { InboxPage, FavoritesRedirect } from "./pages/RedirectPages";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { StatsOverview } from "@/components/stats/StatsOverview";

export const ProfileRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/profile/products" replace />} />
      <Route path="purchases" element={<PurchasesPage />} />
      <Route path="sales" element={<SalesPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="inbox" element={<InboxPage />} />
      <Route path="favorites" element={<FavoritesRedirect />} />
      <Route path="stats" element={<StatsOverview />} />
      <Route path="wallet" element={<PlaceholderPage title="Wallet" />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="help" element={<HelpPage />} />
    </Routes>
  );
};
