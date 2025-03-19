
import { useState } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for updating user profile data
 */
export function useProfileUpdate(profile: Profile | null, setProfile: (profile: Profile | null) => void) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

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

      // Update local state - fixed typings for setProfile function
      setProfile(profile ? { ...profile, ...updates } : null);
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

  return { updateProfile, saving };
}
