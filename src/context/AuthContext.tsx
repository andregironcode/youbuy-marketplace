import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminStatusChecked: boolean;
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
  const [adminStatusChecked, setAdminStatusChecked] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const initialSession = data.session;
        
        if (!isMounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        setAuthInitialized(true);
        
        if (initialSession?.user) {
          console.log("Initial session, checking admin status for:", initialSession.user.id);
          
          setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              const adminResult = await checkIsAdmin();
              if (isMounted) {
                setIsAdmin(adminResult);
                setAdminStatusChecked(true);
                console.log("Initial admin check result:", adminResult);
              }
            } catch (error) {
              console.error("Error in initial admin check:", error);
              if (isMounted) {
                setAdminStatusChecked(true);
              }
            }
          }, 500);
        } else {
          if (isMounted) {
            setAdminStatusChecked(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
          setAuthInitialized(true);
          setAdminStatusChecked(true);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      
      if (!isMounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      setAdminStatusChecked(false);
      
      if (newSession?.user) {
        setTimeout(async () => {
          if (!isMounted) return;
          
          try {
            const adminResult = await checkIsAdmin();
            if (isMounted) {
              console.log("Auth change admin check result:", adminResult);
              setIsAdmin(adminResult);
              setAdminStatusChecked(true);
            }
          } catch (error) {
            console.error("Error in auth change admin check:", error);
            if (isMounted) {
              setAdminStatusChecked(true);
            }
          }
        }, 500);
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
      if (isCheckingAdmin) {
        console.log("Already checking admin status, returning current value:", isAdmin);
        return isAdmin;
      }
      
      setIsCheckingAdmin(true);
      console.log("Checking admin status in AuthContext, user:", user?.id);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      
      if (!currentSession?.user) {
        console.log("No valid session found in checkIsAdmin");
        setIsCheckingAdmin(false);
        return false;
      }
      
      console.log("Performing RPC call to check admin status with session:", currentSession.user.id);
      const { data, error } = await supabase.rpc('is_admin', {
        user_uuid: currentSession.user.id
      });
      
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
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
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
