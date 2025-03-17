import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in .env.local');
}

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 5,
    },
  },
});

// Enable debug mode for Supabase client to help troubleshoot
if (import.meta.env.DEV) {
  console.log('Enabling Supabase debug mode in development');
  supabase.realtime.setDebug(true);
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

export {
  PostgrestError,
  SupabaseClient
} from '@supabase/supabase-js';

export type {
  Session,
  User,
} from '@supabase/supabase-js';
