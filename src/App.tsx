import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { WalletProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { NotificationProvider } from "@/components/NotificationProvider";
import Index from "@/pages/Index";
import ProductDetail from "@/pages/ProductDetail";
import CategoryPage from "@/pages/CategoryPage";
import SearchPage from "@/pages/SearchPage";
import SellerProfile from "@/pages/SellerProfile";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import AdminAuth from "@/pages/AdminAuth";
import AdminPage from "@/pages/AdminPage";
import Sell from "@/pages/Sell";
import ProductEditPage from "@/pages/ProductEditPage";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
import CheckoutPage from "@/pages/Checkout";
import CategoriesPage from "@/pages/CategoriesPage";
import TestPage from "@/pages/TestPage";
import WalletPage from "@/pages/WalletPage";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <WalletProvider>
            <TooltipProvider>
              <Toaster />
              <NotificationProvider />
              <Router>
                <div className="flex flex-col w-full">
                  <Routes>
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminAuth />} />
                    <Route path="/admin/*" element={<AdminPage />} />
                    
                    {/* Regular routes with navbar */}
                    <Route
                      path="*"
                      element={
                        <>
                          <Navbar />
                          <div className="flex-1 w-full">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/auth/callback" element={<AuthCallback />} />
                              {/* Fixed route here to ensure parameter is named 'id' */}
                              <Route path="/product/:id" element={<ProductDetail />} />
                              <Route path="/checkout/:id" element={<CheckoutPage />} />
                              <Route path="/category/:categoryId" element={<CategoryPage />} />
                              <Route path="/category/:categoryId/:subcategoryId" element={<CategoryPage />} />
                              <Route
                                path="/category/:categoryId/:subcategoryId/:subSubcategoryId"
                                element={<CategoryPage />}
                              />
                              <Route path="/categories" element={<CategoriesPage />} />
                              <Route path="/search" element={<SearchPage />} />
                              <Route path="/seller/:id" element={<SellerProfile />} />
                              <Route path="/sell" element={<Sell />} />
                              <Route path="/wallet" element={<WalletPage />} />
                              <Route path="/profile/*" element={<Profile />} />
                              <Route path="/profile/edit-product/:id" element={<ProductEditPage />} />
                              <Route path="/messages" element={<Messages />} />
                              <Route path="/messages/:chatId" element={<Messages />} />
                              <Route path="/favorites" element={<Favorites />} />
                              <Route path="/notifications" element={<Notifications />} />
                              <Route path="/test" element={<TestPage />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </div>
                        </>
                      }
                    />
                  </Routes>
                </div>
              </Router>
            </TooltipProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
