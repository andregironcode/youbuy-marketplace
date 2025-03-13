
import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

// Page imports
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Messages from "@/pages/Messages";
import Sell from "@/pages/Sell";
import Favorites from "@/pages/Favorites";
import Profile from "@/pages/Profile";
import ProfileStats from "@/pages/ProfileStats";
import ProductDetail from "@/pages/ProductDetail";
import ProductEditPage from "@/pages/ProductEditPage";
import SellerProfile from "@/pages/SellerProfile";
import SearchPage from "@/pages/SearchPage";
import CategoryPage from "@/pages/CategoryPage";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

// Component imports
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="youbuy-theme">
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile/*" element={<Profile />} />
                <Route path="/profile/stats" element={<ProfileStats />} />
                <Route path="/profile/purchases" element={<h1>Purchases</h1>} />
                <Route path="/profile/sales" element={<h1>Sales</h1>} />
                <Route path="/profile/products" element={<h1>Products</h1>} />
                <Route path="/profile/wallet" element={<h1>Wallet</h1>} />
                <Route path="/profile/settings" element={<h1>Settings</h1>} />
                <Route path="/profile/help" element={<h1>Help</h1>} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/product/:id/edit" element={<ProductEditPage />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
