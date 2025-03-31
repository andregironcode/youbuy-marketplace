import { supabase } from './client';

export async function initializeStorage() {
  try {
    console.log('Starting storage initialization...');
    
    // Check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error checking session:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!session) {
      console.error('No active session found');
      throw new Error('You must be logged in to access storage');
    }

    console.log('User authenticated:', session.user.id);
    
    // Test bucket access with a simple operation
    console.log('Testing bucket access...');
    const { data: testData, error: testError } = await supabase.storage
      .from('user-uploaded-avatars')
      .list();

    if (testError) {
      console.error('Error accessing bucket:', testError);
      console.error('Error details:', {
        message: testError.message,
        name: testError.name
      });
      throw new Error(`Bucket access error: ${testError.message}`);
    }
    
    console.log('Bucket access successful');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    return false;
  }
}

// Call this function when your app initializes
initializeStorage().then(success => {
  if (success) {
    console.log('Storage initialized successfully');
  } else {
    console.error('Failed to initialize storage');
  }
}); 