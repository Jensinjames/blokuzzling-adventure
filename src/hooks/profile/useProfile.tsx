
import { useProfileFetch } from './useProfileFetch';
import { useProfileUpdate } from './useProfileUpdate';
import { useProfileSync } from './useProfileSync';
import { useAuth } from '@/hooks/useAuth';

/**
 * Main profile hook that combines fetching, updating, and subscription syncing
 */
export function useProfile() {
  const { profile, setProfile, loading, error } = useProfileFetch();
  const { updateProfile, saving } = useProfileUpdate(profile, setProfile);
  const { subscription } = useAuth();
  
  // Sync profile with subscription data
  useProfileSync(profile, setProfile);

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
