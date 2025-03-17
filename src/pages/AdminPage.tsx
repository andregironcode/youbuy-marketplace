
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/pages/AdminDashboard";
import { AdminUsers } from "@/components/admin/pages/AdminUsers";
import { AdminProducts } from "@/components/admin/pages/AdminProducts";
import { AdminOrders } from "@/components/admin/pages/AdminOrders";
import { AdminReports } from "@/components/admin/pages/AdminReports";
import { AdminSettings } from "@/components/admin/pages/AdminSettings";
import { AdminSupport } from "@/components/admin/pages/AdminSupport";
import { DeliveryRoutes } from "@/components/admin/pages/DeliveryRoutes";
import { DriverPanel } from "@/components/delivery/DriverPanel";

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/orders" element={<AdminOrders />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/support" element={<AdminSupport />} />
        <Route path="/delivery-routes" element={<DeliveryRoutes />} />
        <Route path="/driver-panel" element={<DriverPanel />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
