
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import Index from "@/pages/Index";
import ProductDetail from "@/pages/ProductDetail";
import CategoryPage from "@/pages/CategoryPage";
import SearchPage from "@/pages/SearchPage";
import SellerProfile from "@/pages/SellerProfile";
import Auth from "@/pages/Auth";
import Sell from "@/pages/Sell";
import ProductEditPage from "@/pages/ProductEditPage";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
import CheckoutPage from "@/pages/Checkout";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 flex flex-col w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout/:id" element={<CheckoutPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/category/:categoryId/:subcategoryId" element={<CategoryPage />} />
                <Route
                  path="/category/:categoryId/:subcategoryId/:subSubcategoryId"
                  element={<CategoryPage />}
                />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/profile/*" element={<Profile />} />
                <Route path="/profile/edit-product/:id" element={<ProductEditPage />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:chatId" element={<Messages />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
