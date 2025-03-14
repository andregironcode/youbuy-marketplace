import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user, signIn, isAdmin, adminStatusChecked } = useAuth();
  const navigate = useNavigate();
  
  // Check if already logged in and is admin
  useEffect(() => {
    const checkAuthStatus = () => {
      if (!user) return;
      
      if (adminStatusChecked) {
        if (isAdmin) {
          console.log("User already verified as admin via context, redirecting");
          toast({
            title: "Welcome back",
            description: "You are already logged in as admin"
          });
          navigate('/admin/dashboard');
        }
      }
    };
    
    checkAuthStatus();
  }, [user, isAdmin, adminStatusChecked, navigate, toast]);

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
      
      // Login successful - navigation will be handled by the useEffect above
      console.log("Login successful");
      toast({
        title: "Login successful",
        description: "Verifying admin privileges..."
      });
      
      // Don't set loading to false here, as we'll navigate away
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
              disabled={isLoading}
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
