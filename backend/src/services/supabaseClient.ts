import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logError, logInfo } from '../utils/logger';

/**
 * Supabase client configuration and initialization
 * Uses service role key for admin-level database operations
 */
class SupabaseClientService {
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;
  private readonly client: SupabaseClient;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

    this.validateConfig();
    this.client = this.initializeClient();
  }

  /**
   * Validates that required environment variables are set
   */
  private validateConfig(): void {
    if (!this.supabaseUrl) {
      const errorMessage = 'SUPABASE_URL is not set in environment variables';
      logError('SupabaseClient', errorMessage);
      throw new Error(errorMessage);
    }

    if (!this.supabaseServiceKey) {
      const errorMessage = 'SUPABASE_SERVICE_KEY is not set in environment variables';
      logError('SupabaseClient', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Initializes the Supabase client with service role key
   */
  private initializeClient(): SupabaseClient {
    try {
      const client = createClient(this.supabaseUrl, this.supabaseServiceKey, {
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
  }

  /**
   * Gets the Supabase client instance
   */
  public getClient(): SupabaseClient {
    return this.client;
  }
}

// Export singleton instance
export default new SupabaseClientService();
