
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Dashboard } from "@/components/admin/Dashboard";
import { UsersPage } from "@/components/admin/UsersPage";
import { ProductsPage } from "@/components/admin/ProductsPage";
import { HelpArticlesPage } from "@/components/admin/HelpArticlesPage";
import { SettingsPage } from "@/components/admin/SettingsPage";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPage = () => {
  const { user, isAdmin, loading, checkIsAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [assigningAdmin, setAssigningAdmin] = useState(false);
  
  useEffect(() => {
    // Double-check admin status when component mounts
    const verifyAdmin = async () => {
      if (user) {
        const isUserAdmin = await checkIsAdmin();
        console.log("Admin verification result:", isUserAdmin);
      }
      setIsChecking(false);
    };
    
    verifyAdmin();
  }, [user, checkIsAdmin]);
  
  const assignAdminRole = async () => {
    if (!user) return;
    
    setAssigningAdmin(true);
    try {
      // Call the assign_admin_role RPC function
      const { data, error } = await supabase.rpc('assign_admin_role', {
        target_user_id: user.id
      });
      
      if (error) {
        console.error("Error assigning admin role:", error);
        toast.error("Failed to assign admin role: " + error.message);
      } else if (data) {
        toast.success("Admin role assigned successfully!");
        // Refresh admin status
        await checkIsAdmin();
        
        toast.info("Admin access granted. The page will reload in a moment.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.warning("Unable to assign admin role. You might not have permission.");
      }
    } catch (err) {
      console.error("Exception assigning admin role:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setAssigningAdmin(false);
    }
  };
  
  // Show loading state while checking auth and admin status
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-youbuy" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }
  
  // Show admin assignment option for admin@example.com users who aren't admins yet
  if (!isAdmin && user?.email === "admin@example.com") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="mr-2 h-6 w-6 text-yellow-500" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              You're logged in as {user.email} but you don't have admin privileges yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click the button below to assign admin role to your account:
            </p>
            <Button 
              onClick={assignAdminRole} 
              disabled={assigningAdmin}
              className="w-full"
            >
              {assigningAdmin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {assigningAdmin ? 'Assigning Admin Role...' : 'Assign Admin Role'}
            </Button>
          </CardContent>
        </Card>
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
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="help-articles" element={<HelpArticlesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminPage;
