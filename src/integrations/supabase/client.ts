
import { createClient } from '@supabase/supabase-js';

// Use default values if environment variables are not defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfgpjwjpshnanjrxhmnm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ3Bqd2pwc2huYW5qcnhobW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNzAwNDgsImV4cCI6MjA1Nzc0NjA0OH0.eClbpmE2hNvSr7R3heIb_atkmFneCas2Y61g3nUZAHA';

const refreshAccessToken = async (refreshToken: string) => {
  const url = `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`;
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'x-client-info': 'supabase-js/2.x'
  };
  const body = JSON.stringify({ refresh_token: refreshToken });

  try {
    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) {
      const responseBody = await response.text();
      console.error("Failed to refresh token:", response.status, responseBody);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error during token refresh:", error);
    return null;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      // Override the default localStorage implementation
      getItem: async (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error setting item to localStorage:', error);
        }
      },
      removeItem: async (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from localStorage:', error);
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
  console.log('Enabling Supabase debug mode in development');
  // Just log that we're in debug mode, but don't try to set loggers as it's not supported in this version
}

// Add more robust error handling for data transformations
export function safeSingleDataCast<T>(data: any): T {
  try {
    if (!data) {
      console.warn('No data received for safe cast');
      return {} as T;
    }
    return data as T;
  } catch (error) {
    console.error('Error casting single data:', error);
    return {} as T;
  }
}

export function safeDataCast<T>(data: any): T[] {
  try {
    if (!Array.isArray(data)) {
      console.warn('Data is not an array for safe cast');
      return [];
    }
    return data as T[];
  } catch (error) {
    console.error('Error casting data array:', error);
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
    console.error('Error parsing avatar URL:', error);
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

export {
  PostgrestError,
  SupabaseClient
} from '@supabase/supabase-js';

export type {
  Session,
  User,
} from '@supabase/supabase-js';
