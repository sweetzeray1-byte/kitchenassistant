// src/config/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; 
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
// Ensure this runs before any code that needs process.env variables
// Alternatively, call dotenv.config() once in your main application entry point file.
dotenv.config();

// Use specific variable names for clarity
const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseServiceKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY; // Recommended name

// Check if credentials are provided and throw if missing
if (!supabaseUrl) {
  const errorMsg = 'Missing Supabase URL. Set SUPABASE_URL in .env file';
  logger.error(errorMsg);
  throw new Error(errorMsg);
}

if (!supabaseServiceKey) {
  const errorMsg = 'Missing Supabase Service Role Key. Set SUPABASE_SERVICE_ROLE_KEY in .env file';
  logger.error(errorMsg);
  throw new Error(errorMsg);
}

// Resilient fetch for Supabase REST calls.
// This environment intermittently drops outbound TLS (the same network/AV issue that
// affects Redis), which surfaces as `TypeError: fetch failed` — sometimes on a poisoned
// keep-alive connection. We retry transient network failures with a fresh request and a
// per-attempt timeout so a single bad connection doesn't 500 the endpoint.
const fetchWithRetry: typeof fetch = async (input: any, init: any = {}) => {
  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    // Generous per-attempt timeout: only abort genuinely-hung connections, so slow-but-valid
    // calls (e.g. token verification) aren't killed prematurely on a flaky network.
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      // Only override the signal if the caller didn't pass one (rare for supabase-js).
      const signal = init?.signal ?? controller.signal;
      return await fetch(input, { ...init, signal });
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        logger.warn(`Supabase fetch failed (attempt ${attempt}/${maxAttempts}), retrying…`, {
          error: err instanceof Error ? err.message : String(err),
        });
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
};

// Initialize and export the typed Supabase client
// Using 'export const' instead of 'export default' is often preferred for clarity, but default is fine too.
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Good for server-side
    autoRefreshToken: false, // Recommended when using service_role key
    detectSessionInUrl: false // Good for server-side
  },
  global: { fetch: fetchWithRetry },
});

logger.info('Supabase client initialized successfully.'); // Use info level for success

