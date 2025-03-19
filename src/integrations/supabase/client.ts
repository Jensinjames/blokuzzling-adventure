
import { createClient } from '@supabase/supabase-js';

// Use default values if environment variables are not defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfgpjwjpshnanjrxhmnm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ3Bqd2pwc2huYW5qcnhobW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNzAwNDgsImV4cCI6MjA1Nzc0NjA0OH0.eClbpmE2hNvSr7R3heIb_atkmFneCas2Y61g3nUZAHA';

// Configure Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Using PKCE flow for secure redirects
    storage: {
      getItem: async (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          // Silent fail on storage errors
        }
      },
      removeItem: async (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // Silent fail on storage errors
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

// Helper functions without debug logging
export function safeSingleDataCast<T>(data: any): T {
  if (!data) {
    return {} as T;
  }
  return data as T;
}

export function safeDataCast<T>(data: any): T[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return data as T[];
}

export function getAvatarUrl(avatarUrl: any): string {
  try {
    if (Array.isArray(avatarUrl) && avatarUrl.length > 0) {
      const firstItem = avatarUrl[0];
      if (typeof firstItem === 'string') return firstItem;
      if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
        return firstItem.url as string;
      }
    }
    if (typeof avatarUrl === 'string') return avatarUrl;
    
    return '';
  } catch (error) {
    return '';
  }
}

export function normalizeProfile(profile: any) {
  if (!profile) return null;
  
  return {
    ...profile,
    avatar_url: getAvatarUrl(profile.avatar_url),
  };
}

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
