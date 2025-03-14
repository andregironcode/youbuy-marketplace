
import { useEffect } from "react";
import { useNavigate, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2 } from "lucide-react";

export const AdminLayout = () => {
  const { isAdmin, loading, checkIsAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Re-verify admin status when component mounts
    const verifyAdminStatus = async () => {
      if (user) {
        const adminStatus = await checkIsAdmin();
        console.log("Admin layout verification:", adminStatus);
        
        // If at the root admin path, redirect to the dashboard
        if (adminStatus && window.location.pathname === "/admin") {
          navigate("/admin/users");
        }
      }
    };
    
    verifyAdminStatus();
    
    // Redirect non-admin users back to home
    if (!loading && !isAdmin) {
      console.log("AdminLayout: Not admin, redirecting to home");
      navigate("/");
    }
  }, [isAdmin, navigate, loading, user, checkIsAdmin]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-youbuy" />
        <span className="ml-2">Verifying admin access...</span>
      </div>
    );
  }
  
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
