
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

export function useProfileActions(
  profile: Profile | null, 
  updateProfile: (updates: Partial<Profile>) => Promise<void>,
  saving: boolean
) {
  const [username, setUsername] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const { signOut } = useAuth();
  
  // Initialize username when profile loads - use callback to avoid re-renders
  const initializeUsername = useCallback((newProfile: Profile | null) => {
    if (newProfile) {
      setUsername(newProfile.username);
    }
  }, []);

  const handleUpdateProfile = useCallback(async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    
    try {
      await updateProfile({ username });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }, [username, updateProfile]);

  const handleSignOut = useCallback(async () => {
    console.log('Initiating sign out from Profile page');
    try {
      await signOut();
      // Navigation is handled in the signOut function
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [signOut]);

  return {
    username,
    setUsername,
    editing,
    setEditing,
    initializeUsername,
    handleUpdateProfile,
    handleSignOut,
    saving
  };
}
