import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logError, logInfo } from '../utils/logger';

const validateConfig = (supabaseUrl: string, supabaseServiceKey: string): void => {
  if (!supabaseUrl) {
    const errorMessage = 'SUPABASE_URL is not set in environment variables';
    logError('SupabaseClient', errorMessage);
    throw new Error(errorMessage);
  }

  if (!supabaseServiceKey) {
    const errorMessage = 'SUPABASE_SERVICE_KEY is not set in environment variables';
    logError('SupabaseClient', errorMessage);
    throw new Error(errorMessage);
  }
};

const initializeClient = (supabaseUrl: string, supabaseServiceKey: string): SupabaseClient => {
  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    logInfo('SupabaseClient', 'Supabase client initialized successfully');
    return client;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('SupabaseClient', `Failed to initialize Supabase client: ${errorMessage}`);
    throw error;
  }
};

const createSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

  validateConfig(supabaseUrl, supabaseServiceKey);
  return initializeClient(supabaseUrl, supabaseServiceKey);
};

const supabaseClient = createSupabaseClient();
export default supabaseClient;
