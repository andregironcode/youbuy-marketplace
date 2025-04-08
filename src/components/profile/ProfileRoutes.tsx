// This file has imports and structure that we don't want to modify
// Let's assume we need to add the Support page to existing routes

import React from "react";
import { Route, Routes } from "react-router-dom";
import { SettingsPage } from "./pages/SettingsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { SalesPage } from "./pages/SalesPage";
import { WalletPage } from "./pages/WalletPage";
import { HelpPage } from "./pages/HelpPage";
import { PremiumPage } from "./pages/PremiumPage";
import { 
  PrivateAccountRedirect, 
  SellerAccountRedirect, 
  PurchasesRedirect,
  SalesRedirect
} from "./pages/RedirectPages";
import { SupportPage } from "./pages/SupportPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ProfileHome } from "@/pages/ProfileHome";

export const ProfileRoutes = () => {
  return (
    <Routes>
      <Route index element={<ProfileHome />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="purchases" element={<PurchasesPage />} />
      <Route path="purchases/:tab" element={<PurchasesPage />} />
      <Route path="sales" element={<SalesPage />} />
      <Route path="sales/:tab" element={<SalesPage />} />
      <Route path="wallet" element={<WalletPage />} />
      <Route path="help" element={<HelpPage />} />
      <Route path="help/:category" element={<HelpPage />} />
      <Route path="premium" element={<PremiumPage />} />
      <Route path="seller" element={<SellerAccountRedirect />} />
      <Route path="seller/sales" element={<SalesRedirect />} />
      <Route path="seller/purchases" element={<PurchasesRedirect />} />
      <Route path="support" element={<SupportPage />} />
      <Route path="statistics" element={<StatisticsPage />} />
      <Route path="favorites" element={<FavoritesPage />} />
    </Routes>
  );
};
