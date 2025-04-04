
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://epkpqlkvhuqnfepfpscd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwa3BxbGt2aHVxbmZlcGZwc2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mzk3MTMsImV4cCI6MjA1NzExNTcxM30.yx_PIyFi01fucqOwG1s8Hz4znk77wnDzKca6DYx5_V4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'wallapop-marketplace',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    }
  }
);

/**
 * Resets the Supabase client connection
 * Useful when connection issues occur
 */
export const resetSupabaseConnection = async () => {
  console.log('Resetting Supabase connection...');
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Error refreshing Supabase session:', error);
      throw error;
    }
    console.log('Supabase connection reset successful');
    return data;
  } catch (error) {
    console.error('Failed to reset Supabase connection:', error);
    throw error;
  }
};

/**
 * Checks if the current user has admin privileges
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
