
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DriverRoutes } from "@/components/delivery/DriverRoutes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverPage = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driverName, setDriverName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session) {
          // Check if user has driver role
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.session.user.id)
            .in('role', ['admin', 'user'])
            .maybeSingle();
            
          if (userRoles) {
            setIsAuthorized(true);
            
            // Get driver's name
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', session.session.user.id)
              .single();
              
            if (profile) {
              setDriverName(profile.full_name || "Driver");
            }
          } else {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "You don't have permission to access the driver panel."
            });
            navigate("/");
          }
        } else {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please log in to access the driver panel."
          });
          navigate("/auth");
        }
      } catch (error) {
        console.error("Error checking driver authentication:", error);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "There was a problem verifying your access."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white border-b shadow-sm p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Driver Portal</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Welcome, {driverName}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline-block">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <DriverRoutes />
      </main>
      
      <footer className="bg-white border-t p-4 text-center text-sm text-muted-foreground">
        Wallapop Delivery System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default DriverPage;
