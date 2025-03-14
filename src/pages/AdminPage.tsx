
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Dashboard } from "@/components/admin/Dashboard";
import { UsersPage } from "@/components/admin/UsersPage";
import { ProductsPage } from "@/components/admin/ProductsPage";
import { HelpArticlesPage } from "@/components/admin/HelpArticlesPage";
import { SettingsPage } from "@/components/admin/SettingsPage";
import { useAuth } from "@/context/AuthContext";

const AdminPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === "admin@example.com";
  
  // Redirect non-admin users to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/help-articles" element={<HelpArticlesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
