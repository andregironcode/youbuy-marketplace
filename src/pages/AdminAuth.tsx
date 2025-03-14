
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

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  
  const { toast } = useToast();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in and is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      setIsCheckingAdmin(true);
      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (data && !error) {
          toast({
            title: "Admin access verified",
            description: "Redirecting to dashboard"
          });
          navigate('/admin/dashboard');
        } else {
          // If logged in but not admin, redirect to home
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate('/');
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
    
    checkAdmin();
  }, [user, navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setErrorMsg(error.message);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message
        });
      }
      // The useEffect hook will handle the admin check and navigation
    } catch (error) {
      console.error("Admin login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMsg(errorMessage);
      toast({
        variant: "destructive",
        title: "Login error",
        description: errorMessage
      });
    } finally {
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
          <p className="text-gray-500">Please wait while we confirm your credentials...</p>
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
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {errorMsg}
              </div>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
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
