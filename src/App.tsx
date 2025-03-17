
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Sell from "./pages/Sell";
import ProductDetail from "./pages/ProductDetail";
import ProductEditPage from "./pages/ProductEditPage";
import Favorites from "./pages/Favorites";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import SellerProfile from "./pages/SellerProfile";
import Messages from "./pages/Messages";
import SearchPage from "./pages/SearchPage";
import Checkout from "./pages/Checkout";
import Notifications from "./pages/Notifications";
import AdminPage from "./pages/AdminPage";
import AdminAuth from "./pages/AdminAuth";
import DriverPage from "./pages/DriverPage";
import { NotificationProvider } from "./components/NotificationProvider";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile/*" element={<Profile />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/product/edit/:productId" element={<ProductEditPage />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/seller/:sellerId" element={<SellerProfile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:chatId" element={<Messages />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/driver-panel" element={<DriverPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
