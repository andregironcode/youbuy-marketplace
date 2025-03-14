
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersPage } from "@/components/admin/UsersPage";
import { ProductsPage } from "@/components/admin/ProductsPage";
import { HelpArticlesPage } from "@/components/admin/HelpArticlesPage";
import { SettingsPage } from "@/components/admin/SettingsPage";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const AdminPage = () => {
  const { user, isAdmin, loading, checkIsAdmin } = useAuth();
  
  useEffect(() => {
    // Double-check admin status when component mounts
    const verifyAdmin = async () => {
      if (user) {
        await checkIsAdmin();
        console.log("Admin verification completed");
      }
    };
    
    verifyAdmin();
  }, [user, checkIsAdmin]);
  
  // Show loading state while checking auth and admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-youbuy" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }
  
  // Redirect non-admin users to home
  if (!isAdmin) {
    console.log("User is not admin, redirecting to home page");
    return <Navigate to="/" replace />;
  }
  
  console.log("Rendering admin routes for admin user");
  
  // If user is admin, render the admin routes WITHOUT nesting
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<UsersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="help-articles" element={<HelpArticlesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
