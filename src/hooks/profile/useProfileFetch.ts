
import { useState, useEffect } from 'react';
import { supabase, safeSingleDataCast, isNotFoundError } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for fetching user profile data
 */
export function useProfileFetch() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data whenever the user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching profile for user ID:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Supabase error details:', error);
          
          if (!isNotFoundError(error)) {
            throw error;
          }
          console.log("No profile found, attempting to create one");
        }

        if (data) {
          console.log("Profile loaded successfully:", data);
          const profileData = safeSingleDataCast<Profile>(data);
          setProfile(profileData);
        } else {
          console.log("No profile found, creating a new one");
          
          // Create a new profile
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              wins: 0,
              losses: 0,
              draws: 0,
              subscription_tier: 'free',
              subscription_status: 'inactive',
              subscription_expiry: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              avatar_url: null
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          console.log("New profile created:", createdProfile);
          const newProfileData = safeSingleDataCast<Profile>(createdProfile);
          setProfile(newProfileData);
        }
      } catch (e: any) {
        const errorMessage = e.message || 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching profile:', e);
        toast.error(`Failed to load profile: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, setProfile, loading, error };
}
