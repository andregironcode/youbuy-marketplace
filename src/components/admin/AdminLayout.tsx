
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if the current user is an admin
  const isAdmin = user?.email === "admin@example.com";
  
  useEffect(() => {
    // Redirect non-admin users back to home
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
