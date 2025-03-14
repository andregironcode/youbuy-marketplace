
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading, isAdmin: authContextIsAdmin } = useAuth();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Don't check if we're still loading auth state
      if (loading) return;
      
      // If no user is logged in, redirect to admin login
      if (!user) {
        console.log("No user logged in, redirecting to admin login");
        navigate("/admin");
        return;
      }

      // If authContext already knows the user is admin, use that information
      if (authContextIsAdmin) {
        console.log("User verified as admin via AuthContext");
        setIsAdmin(true);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        console.log("Checking admin status for user:", user.id);
        // Check if user is admin using the is_admin RPC function
        const { data, error } = await supabase.rpc('is_admin');
        
        console.log("Admin check response:", { data, error });
        
        if (error) {
          console.error("Admin verification error:", error);
          toast({
            variant: "destructive",
            title: "Verification error",
            description: "Could not verify admin status: " + error.message
          });
          navigate("/admin");
          return;
        }
        
        if (!data) {
          console.log("User is not an admin, redirecting");
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate("/");
          return;
        }
        
        // User is admin, set state and continue
        console.log("User verified as admin");
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin verification error:", error);
        toast({
          variant: "destructive",
          title: "Verification error",
          description: "Could not verify admin status due to an unexpected error"
        });
        navigate("/");
      } finally {
        // Always end the checking state to prevent infinite loop
        setIsCheckingAdmin(false);
      }
    };

    // Reset the timer on each re-render to avoid overlapping calls
    let timer: ReturnType<typeof setTimeout>;
    
    // Only run the check if we haven't exceeded attempts and are still checking
    if (isCheckingAdmin && checkAttempts < 3) {
      timer = setTimeout(() => {
        if (!loading) {
          checkAdminAccess();
          setCheckAttempts(prev => prev + 1);
        }
      }, 500); // Small delay to ensure auth state is loaded
    } else if (checkAttempts >= 3 && isCheckingAdmin) {
      // Force end checking after 3 attempts to prevent infinite loops
      console.log("Forcing end of admin check after multiple attempts");
      setIsCheckingAdmin(false);
      if (!isAdmin) {
        navigate("/admin");
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, loading, navigate, toast, checkAttempts, authContextIsAdmin, isCheckingAdmin]);

  // Show loading state while checking admin status
  if (loading || isCheckingAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-red-600" />
        <p className="text-lg font-medium">Verifying admin access...</p>
        <p className="text-sm text-muted-foreground mt-2">
          {checkAttempts > 0 ? `Attempt ${checkAttempts}/3...` : ""}
        </p>
      </div>
    );
  }

  // If not admin or not logged in, don't render admin content
  if (!user || !isAdmin) {
    // This should usually not be visible as we navigate away in useEffect
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-lg font-medium text-red-600">Access denied</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate("/admin")}
        >
          Back to Admin Login
        </Button>
      </div>
    );
  }

  // Render admin content
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
