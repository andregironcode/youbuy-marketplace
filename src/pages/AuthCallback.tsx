import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the URL hash parameters
      const hashParams = window.location.hash;
      
      if (hashParams) {
        try {
          // The session should be automatically set by Supabase when redirect happens
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            toast({
              variant: 'destructive',
              title: 'Authentication Failed',
              description: error.message,
            });
            navigate('/auth');
            return;
          }
          
          if (data.session) {
            toast({
              title: 'Successfully Logged In',
              description: 'Welcome to YouBuy!',
            });
            navigate('/');
          } else {
            navigate('/auth');
          }
        } catch (error) {
          console.error('Error in auth callback:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: 'An unexpected error occurred during authentication.',
          });
          navigate('/auth');
        }
      } else {
        // No hash params, redirect to auth page
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-youbuy" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
} 