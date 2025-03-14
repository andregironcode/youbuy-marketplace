
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Dashboard } from "@/components/admin/Dashboard";
import { UsersPage } from "@/components/admin/UsersPage";
import { ProductsPage } from "@/components/admin/ProductsPage";
import { HelpArticlesPage } from "@/components/admin/HelpArticlesPage";
import { SettingsPage } from "@/components/admin/SettingsPage";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const AdminPage = () => {
  const { user, isAdmin, loading, checkIsAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Double-check admin status when component mounts
    const verifyAdmin = async () => {
      if (user) {
        await checkIsAdmin();
      }
      setIsChecking(false);
    };
    
    verifyAdmin();
  }, [user, checkIsAdmin]);
  
  // Show loading state while checking auth and admin status
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-youbuy" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }
  
  // Redirect non-admin users to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="help-articles" element={<HelpArticlesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminPage;
