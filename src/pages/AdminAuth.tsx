
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  const { toast } = useToast();
  const { user, signIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Check if already logged in and is admin
  useEffect(() => {
    if (!user || isCheckingAdmin) return; // Skip if no user or already checking
    
    const checkAdmin = async () => {
      setIsCheckingAdmin(true);
      try {
        console.log("Checking if logged in user is admin:", user.id);
        const { data, error } = await supabase.rpc('is_admin');
        console.log("Admin check response:", { data, error });
        
        if (error) {
          console.error("Admin check error:", error);
          toast({
            variant: "destructive",
            title: "Verification error",
            description: error.message
          });
          setIsCheckingAdmin(false);
          return;
        }
        
        if (data) {
          // User is admin, redirect to dashboard
          console.log("User is admin, redirecting to dashboard");
          toast({
            title: "Admin access verified",
            description: "Redirecting to dashboard"
          });
          navigate('/admin/dashboard');
        } else {
          // Logged in but not an admin
          console.log("User is logged in but not an admin");
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          
          // Sign out the user if they're not an admin
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Admin check error:", error);
        toast({
          variant: "destructive",
          title: "Verification error",
          description: "Could not verify admin privileges"
        });
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    // Reset check attempts when user changes
    setCheckAttempts(0);
    
    // Only perform check if we haven't exceeded maximum attempts
    if (checkAttempts < 3) {
      checkAdmin();
      setCheckAttempts(prev => prev + 1);
    }
  }, [user, navigate, toast, checkAttempts]);

  // Effect to check if user is already an admin via context
  useEffect(() => {
    if (user && isAdmin) {
      console.log("User already verified as admin via context, redirecting");
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      console.log("Attempting admin login for:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        setErrorMsg(error.message);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message
        });
        setIsLoading(false);
        return;
      }
      
      // If login was successful, the useEffect hook will handle the admin check and navigation
      console.log("Login successful, checking admin status");
      // We don't set isLoading to false here as the useEffect will handle the redirect
      
    } catch (error) {
      console.error("Admin login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMsg(errorMessage);
      toast({
        variant: "destructive",
        title: "Login error",
        description: errorMessage
      });
      setIsLoading(false);
    }
  };

  // If checking admin status, show loading state
  if (isCheckingAdmin) {
    return (
      <main className="flex-1 container py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Verifying admin access</h2>
          <p className="text-gray-500">
            Please wait while we confirm your credentials...
            {checkAttempts > 1 ? ` (Attempt ${checkAttempts}/3)` : ''}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 container py-8 flex items-center justify-center">
      <div className="mx-auto max-w-md w-full">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            <span className="font-bold text-xl">Admin Panel</span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Access restricted to authorized administrators only
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {errorMsg && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isCheckingAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isCheckingAdmin}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading || isCheckingAdmin}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm"
              disabled={isLoading || isCheckingAdmin}
            >
              Return to main site
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default AdminAuth;
