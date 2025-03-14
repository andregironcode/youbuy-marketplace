
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading) {
        if (!user) {
          navigate("/admin");
          return;
        }

        // Check if user is admin
        const { data, error } = await supabase.rpc('is_admin');
        
        if (!data || error) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate("/");
        }
      }
    };

    checkAdminAccess();
  }, [user, loading, navigate, toast]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Verifying admin access...</div>;
  }

  if (!user) return null;

  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-gray-100">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
