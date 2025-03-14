
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in and is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data, error } = await supabase.rpc('is_admin');
        if (data && !error) {
          navigate('/admin/dashboard');
        } else {
          // If logged in but not admin, redirect to home
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate('/');
        }
      }
    };
    
    checkAdmin();
  }, [user, navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setErrorMsg(error.message);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message
        });
      } else {
        // Check if user is admin
        const { data, error: adminError } = await supabase.rpc('is_admin');
        
        if (data && !adminError) {
          toast({
            title: "Admin login successful",
            description: "Welcome to the admin dashboard"
          });
          navigate('/admin/dashboard');
        } else {
          // If not admin, sign out and show error
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
