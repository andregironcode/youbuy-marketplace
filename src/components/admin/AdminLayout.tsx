
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading, isAdmin, adminStatusChecked, checkIsAdmin } = useAuth();
  const [verificationState, setVerificationState] = useState<'pending' | 'success' | 'failed'>('pending');
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const verifyAdminAccess = async () => {
      console.log("Verify admin access called. User:", user?.id, "Admin checked:", adminStatusChecked, "Is admin:", isAdmin);
      
      // Skip verification if still loading auth
      if (loading) {
        console.log("Auth still loading, waiting...");
        return;
      }

      // If no user, redirect to login
      if (!user) {
        console.log("No user logged in, redirecting to admin login");
        if (isMounted) {
          setVerificationState('failed');
          navigate("/admin");
        }
        return;
      }

      // Once admin status is checked in the auth context
      if (adminStatusChecked) {
        console.log("Admin status checked:", isAdmin);
        if (isAdmin) {
          console.log("User verified as admin, proceeding to dashboard");
          if (isMounted) {
            setVerificationState('success');
          }
        } else {
          console.log("User is not an admin, redirecting");
          if (isMounted) {
            setVerificationState('failed');
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "You don't have admin privileges"
            });
            navigate("/");
          }
        }
        return;
      }

      // If we get here, admin status is still being checked
      if (verificationAttempts < 2) { // Reduced from 3 to 2 attempts
        console.log(`Verification attempt ${verificationAttempts + 1}/2`);
        if (isMounted) {
          setVerificationAttempts(prev => prev + 1);
        
          // Make a direct admin check attempt with delay to prevent race conditions
          timeoutId = setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              // Force a recheck of admin status
              const adminResult = await checkIsAdmin();
              console.log("Direct admin check result:", adminResult);
              
              if (isMounted) {
                if (adminResult) {
                  setVerificationState('success');
                } else {
                  // Wait for one more check from the context before giving up
                  if (verificationAttempts >= 1) {
                    setVerificationState('failed');
                    toast({
                      variant: "destructive",
                      title: "Access denied",
                      description: "You don't have admin privileges"
                    });
                    navigate("/");
                  }
                }
              }
            } catch (error) {
              console.error("Admin check error:", error);
              // Only schedule next check on first attempt
              if (isMounted && verificationAttempts === 0) {
                // Next check will happen automatically via increment above
              }
            }
          }, 1000); // Longer delay to ensure auth is settled
        }
      } else {
        // Give up after max attempts
        console.log("Max verification attempts reached, redirecting");
        if (isMounted) {
          setVerificationState('failed');
          toast({
            variant: "destructive",
            title: "Verification timeout",
            description: "Could not verify admin status in time"
          });
          navigate("/admin");
        }
      }
    };

    // Start verification process
    verifyAdminAccess();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, loading, isAdmin, adminStatusChecked, verificationAttempts, navigate, toast, checkIsAdmin]);

  // Show loading state while checking admin status
  if (loading || verificationState === 'pending') {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-red-600" />
        <p className="text-lg font-medium">Verifying admin access...</p>
        {verificationAttempts > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Attempt {verificationAttempts}/2...
          </p>
        )}
      </div>
    );
  }

  // If verification failed (this should usually not be visible as we navigate away)
  if (verificationState === 'failed') {
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

  // Render admin content when verification successful
  return (
    <div className="h-screen flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-gray-100">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
