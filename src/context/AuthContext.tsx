
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminStatusChecked: boolean; // New flag to track if admin status was checked
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
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [adminStatusChecked, setAdminStatusChecked] = useState(false); // Track if we've checked admin status

  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log("Initial session, checking admin status for:", session.user.id);
          const adminResult = await checkIsAdmin();
          if (isMounted) {
            setIsAdmin(adminResult);
            setAdminStatusChecked(true);
            console.log("Initial admin check result:", adminResult);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
          setAdminStatusChecked(true); // Mark as checked even on error to prevent loops
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Reset admin status check when auth state changes
      setAdminStatusChecked(false);
      
      if (session?.user) {
        const adminResult = await checkIsAdmin();
        if (isMounted) {
          console.log("Auth change admin check result:", adminResult);
          setIsAdmin(adminResult);
          setAdminStatusChecked(true);
        }
      } else {
        setIsAdmin(false);
        setAdminStatusChecked(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function checkIsAdmin(): Promise<boolean> {
    try {
      // If already checking, don't start another check
      if (isCheckingAdmin) {
        console.log("Already checking admin status, returning current value:", isAdmin);
        return isAdmin;
      }
      
      setIsCheckingAdmin(true);
      console.log("Checking admin status in AuthContext");
      
      // Ensure we have a valid session
      if (!user) {
        console.log("No user logged in, cannot be admin");
        setIsCheckingAdmin(false);
        return false;
      }
      
      const { data, error } = await supabase.rpc('is_admin');
      
      setIsCheckingAdmin(false);
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      console.log("Admin check result:", data);
      return !!data;
    } catch (error) {
      console.error("Error in checkIsAdmin:", error);
      setIsCheckingAdmin(false);
      return false;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        const isAdminUser = await checkIsAdmin();
        setIsAdmin(isAdminUser);
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
    adminStatusChecked,
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
