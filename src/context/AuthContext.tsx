
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  checkIsAdmin: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check admin status when session is set
      if (session?.user) {
        checkIsAdmin().then(isAdmin => {
          setIsAdmin(isAdmin);
          console.log("Initial admin check:", isAdmin);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check admin status when auth state changes
      if (session?.user) {
        checkIsAdmin().then(isAdmin => {
          setIsAdmin(isAdmin);
          console.log("Auth change admin check:", isAdmin);
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkIsAdmin(): Promise<boolean> {
    if (!user) return false;
    
    try {
      // Use our database function to check if the user is an admin
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      console.log("is_admin RPC result:", data);
      return data || false;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // After successful sign-in, check if the user is an admin
      if (!error) {
        const isUserAdmin = await checkIsAdmin();
        setIsAdmin(isUserAdmin);
        console.log("Sign-in admin status:", isUserAdmin);
        
        if (email === "admin@example.com" && !isUserAdmin) {
          toast.error("You are logged in as admin@example.com but don't have admin role assigned. Please contact support.");
        }
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }

  const value = {
    session,
    user,
    loading,
    isAdmin,
    checkIsAdmin,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
