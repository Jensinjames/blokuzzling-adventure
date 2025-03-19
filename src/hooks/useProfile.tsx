
import { useState, useEffect } from 'react';
import { supabase, safeSingleDataCast, isNotFoundError } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

/**
 * Hook for fetching and managing user profile data
 * Works with the updated auth structure and improves error handling
 */
export function useProfile() {
  const { user, subscription } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
          
          // Ensure profile has subscription data in sync with auth context
          if (subscription && (
            profileData.subscription_tier !== subscription.tier ||
            profileData.subscription_status !== subscription.status ||
            profileData.subscription_expiry !== subscription.expiry
          )) {
            console.log('Syncing profile subscription data with auth context');
            const updatedProfile = await syncProfileSubscription(profileData, subscription);
            setProfile(updatedProfile);
          } else {
            setProfile(profileData);
          }
        } else {
          console.log("No profile found, creating a new one");
          
          // Create a new profile with subscription data from auth context
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              wins: 0,
              losses: 0,
              draws: 0,
              subscription_tier: subscription?.tier || 'free',
              subscription_status: subscription?.status || 'inactive',
              subscription_expiry: subscription?.expiry || null,
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
  }, [user, subscription]);

  // Helper function to sync profile subscription with auth context
  const syncProfileSubscription = async (profile: Profile, subscriptionData: any) => {
    try {
      const updates = {
        subscription_tier: subscriptionData.tier || profile.subscription_tier || 'free',
        subscription_status: subscriptionData.status || profile.subscription_status || 'inactive',
        subscription_expiry: subscriptionData.expiry || profile.subscription_expiry || null,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error syncing profile subscription:', error);
        return profile;
      }
      
      return safeSingleDataCast<Profile>(data);
    } catch (e) {
      console.error('Failed to sync profile subscription:', e);
      return profile;
    }
  };

  // Function to update profile data
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      console.log('Updating profile for user:', user.id, 'with data:', updates);
      setSaving(true);
      
      // Handle avatar_url conversion to match the database format (Json[])
      const updateObject: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // If avatar_url is a string being updated, convert it to the expected Json[] format
      if (typeof updates.avatar_url === 'string') {
        updateObject.avatar_url = [updates.avatar_url];
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateObject)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error details:', error);
        throw error;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      
      // Fetch updated profile to ensure we have the latest data
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.warn('Error refreshing profile after update:', fetchError);
      } else if (data) {
        const updatedProfileData = safeSingleDataCast<Profile>(data);
        setProfile(updatedProfileData);
      }
      
    } catch (e: any) {
      toast.error(`Failed to update profile: ${e.message || 'Unknown error'}`);
      console.error('Error updating profile:', e);
    } finally {
      setSaving(false);
    }
  };

  return { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    saving, 
    hasSubscription: !!subscription?.isActive 
  };
}

export default useProfile;
