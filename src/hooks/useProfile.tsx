
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Try to query using the API schema explicitly
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }

        if (data) {
          console.log("Profile loaded successfully:", data);
          setProfile(data as Profile);
        } else {
          console.log("No profile found, attempting to create one");
          // If no profile exists, create one
          const newProfile: Partial<Profile> = {
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            wins: 0,
            losses: 0,
            draws: 0,
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          console.log("New profile created:", createdProfile);
          setProfile(createdProfile as Profile);
        }
      } catch (e: any) {
        setError(e.message);
        console.error('Error fetching profile:', e);
        toast.error(`Failed to load profile: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      console.log('Updating profile for user:', user.id, 'with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error details:', error);
        throw error;
      }

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
        setProfile(data as Profile);
      }
      
    } catch (e: any) {
      toast.error(`Failed to update profile: ${e.message}`);
      console.error('Error updating profile:', e);
    }
  };

  return { profile, loading, error, updateProfile };
}
