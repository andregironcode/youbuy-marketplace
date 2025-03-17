
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { DriverPanel } from '@/components/delivery/DriverPanel';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DriverPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDriverStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if the user has the driver role in the user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'driver')
          .maybeSingle();
        
        if (error) {
          console.error('Error checking driver status:', error);
          setIsDriver(false);
        } else {
          setIsDriver(!!data); // User is a driver if we found a matching record
        }
      } catch (err) {
        console.error('Error in driver check:', err);
        setIsDriver(false);
      } finally {
        setLoading(false);
      }
    };

    checkDriverStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Driver Portal</h1>
        <p className="mb-6 text-center">Please sign in to access the driver portal.</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  if (!isDriver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6 text-center">You do not have driver privileges. Please contact an administrator.</p>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
      </div>
    );
  }

  return <DriverPanel />;
};

export default DriverPage;
