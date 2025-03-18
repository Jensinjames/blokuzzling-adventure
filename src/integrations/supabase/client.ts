
import { createClient } from '@supabase/supabase-js';

// Use default values if environment variables are not defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfgpjwjpshnanjrxhmnm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ3Bqd2pwc2huYW5qcnhobW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNzAwNDgsImV4cCI6MjA1Nzc0NjA0OH0.eClbpmE2hNvSr7R3heIb_atkmFneCas2Y61g3nUZAHA';

// Enhanced token refresh function with better error reporting and debug information
const refreshAccessToken = async (refreshToken: string) => {
  const url = `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'x-client-info': 'supabase-js/2.x'
  };
  const body = JSON.stringify({ refresh_token: refreshToken });

  try {
    console.log('[Auth Debug] Attempting to refresh token');
    const response = await fetch(url, { method: 'POST', headers, body });
    
    if (!response.ok) {
      const responseBody = await response.text();
      console.error("[Auth Debug] Failed to refresh token:", response.status, responseBody);
      return null;
    }
    
    const data = await response.json();
    console.log('[Auth Debug] Token refreshed successfully');
    return data;
  } catch (error) {
    console.error("[Auth Debug] Error during token refresh:", error);
    return null;
  }
};

// Configure Supabase client with enhanced debugging
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      // Enhanced storage implementation with better error and debug reporting
      getItem: async (key) => {
        try {
          console.log(`[Auth Debug] Getting auth item: ${key}`);
          const value = localStorage.getItem(key);
          if (value) {
            console.log(`[Auth Debug] Auth item found for key: ${key}`);
          } else {
            console.log(`[Auth Debug] No auth item found for key: ${key}`);
          }
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('[Auth Debug] Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          console.log(`[Auth Debug] Setting auth item: ${key}`);
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('[Auth Debug] Error setting item to localStorage:', error);
        }
      },
      removeItem: async (key) => {
        try {
          console.log(`[Auth Debug] Removing auth item: ${key}`);
          localStorage.removeItem(key);
        } catch (error) {
          console.error('[Auth Debug] Error removing item from localStorage:', error);
        }
      }
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 5,
    },
  },
});

// Enable debug mode for Supabase client to help troubleshoot
if (import.meta.env.DEV) {
  console.log('[Auth Debug] Supabase client initialized with the following configuration:');
  console.log(`[Auth Debug] URL: ${supabaseUrl}`);
  console.log('[Auth Debug] Anon Key: [key hidden for security]');
  console.log('[Auth Debug] Auto Refresh Token: true');
  console.log('[Auth Debug] Persist Session: true');
  console.log('[Auth Debug] Detect Session In URL: true');
}

// Add more robust error handling for data transformations
export function safeSingleDataCast<T>(data: any): T {
  try {
    if (!data) {
      console.warn('[Data Debug] No data received for safe cast');
      return {} as T;
    }
    return data as T;
  } catch (error) {
    console.error('[Data Debug] Error casting single data:', error);
    return {} as T;
  }
}

export function safeDataCast<T>(data: any): T[] {
  try {
    if (!Array.isArray(data)) {
      console.warn('[Data Debug] Data is not an array for safe cast');
      return [];
    }
    return data as T[];
  } catch (error) {
    console.error('[Data Debug] Error casting data array:', error);
    return [];
  }
}

// Helper to get avatar URL from Json[] type
export function getAvatarUrl(avatarUrl: any): string {
  try {
    // If it's an array (Json[]), take the first element
    if (Array.isArray(avatarUrl) && avatarUrl.length > 0) {
      const firstItem = avatarUrl[0];
      if (typeof firstItem === 'string') return firstItem;
      if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
        return firstItem.url as string;
      }
    }
    // If it's a string, return directly
    if (typeof avatarUrl === 'string') return avatarUrl;
    
    return '';
  } catch (error) {
    console.error('[Data Debug] Error parsing avatar URL:', error);
    return '';
  }
}

// Helper to normalize profiles from different sources
export function normalizeProfile(profile: any) {
  if (!profile) return null;
  
  return {
    ...profile,
    // Ensure avatar_url is always accessible in a consistent way
    avatar_url: getAvatarUrl(profile.avatar_url),
    // Add other normalizations as needed
  };
}

// Helper to check if an error is a not found error
export function isNotFoundError(error: any): boolean {
  return error?.message?.includes('not found') || error?.code === 'PGRST116';
}

// Debug helper to log auth errors
export function logAuthError(action: string, error: any): void {
  console.error(`[Auth Debug] Error during ${action}:`, {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    details: error?.details,
    hint: error?.hint,
    name: error?.name,
  });
}

export {
  PostgrestError,
  SupabaseClient
} from '@supabase/supabase-js';

export type {
  Session,
  User,
} from '@supabase/supabase-js';
