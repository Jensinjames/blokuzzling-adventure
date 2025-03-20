
import { useState } from 'react';
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
  
  // Initialize username when profile loads
  const initializeUsername = (newProfile: Profile | null) => {
    if (newProfile) {
      setUsername(newProfile.username);
    }
  };

  const handleUpdateProfile = async () => {
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
  };

  const handleSignOut = async () => {
    console.log('Initiating sign out from Profile page');
    try {
      await signOut();
      // Navigation is handled in the signOut function
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

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
