
import { useEffect } from 'react';
import { supabase, safeSingleDataCast } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to sync profile subscription data with auth context
 */
export function useProfileSync(profile: Profile | null, setProfile: (profile: Profile | null) => void) {
  const { subscription } = useAuth();

  // Sync profile subscription with auth context
  useEffect(() => {
    if (!profile || !subscription) return;

    const syncProfileSubscription = async () => {
      // Check if profile needs updating
      if (
        profile.subscription_tier !== subscription.tier ||
        profile.subscription_status !== subscription.status ||
        profile.subscription_expiry !== subscription.expiry
      ) {
        console.log('Syncing profile subscription data with auth context');
        
        try {
          const updates = {
            subscription_tier: subscription.tier || profile.subscription_tier || 'free',
            subscription_status: subscription.status || profile.subscription_status || 'inactive',
            subscription_expiry: subscription.expiry || profile.subscription_expiry || null,
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
            return;
          }
          
          const syncedProfile = safeSingleDataCast<Profile>(data);
          setProfile(syncedProfile);
        } catch (e) {
          console.error('Failed to sync profile subscription:', e);
        }
      }
    };

    syncProfileSubscription();
  }, [profile, subscription, setProfile]);
}
