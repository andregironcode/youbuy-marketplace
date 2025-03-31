import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Create a new client with service role for storage operations
export const supabaseAdmin = createClient<Database>(
  "https://epkpqlkvhuqnfepfpscd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwa3BxbGt2aHVxbmZlcGZwc2NkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTUzOTcxMywiZXhwIjoyMDU3MTE1NzEzfQ.2Yx_PIyFi01fucqOwG1s8Hz4znk77wnDzKca6DYx5_V4"
); 