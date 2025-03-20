
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionStatus } from '@/types/subscription';

/**
 * Check if a user has an active subscription
 * @param userId The user's ID
 * @returns Boolean indicating if user has an active subscription
 */
export async function checkUserSubscription(userId: string): Promise<SubscriptionStatus> {
  try {
    if (!userId) {
      return { 
        hasSubscription: false, 
        tier: null, 
        expiresAt: null,
        status: null,
        expiry: null,
        isActive: false,
        isPremium: false,
        isBasicOrHigher: false
      };
    }
    
    console.log('Checking subscription for user:', userId);
    
    // First check if user has any subscription data in the subscriptions table
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error checking subscription:', subscriptionError);
      throw subscriptionError;
    }
    
    // If user has an active subscription, return the details
    if (subscriptionData) {
      const tier = subscriptionData.tier || 'standard';
      return {
        hasSubscription: true,
        tier: tier,
        expiresAt: subscriptionData.expires_at,
        status: 'active',
        expiry: subscriptionData.expires_at,
        isActive: true,
        isPremium: tier === 'premium',
        isBasicOrHigher: tier === 'basic' || tier === 'premium'
      };
    }
    
    // As a fallback, check with the edge function for subscription verification
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('Error getting user for subscription check:', userError);
        return { 
          hasSubscription: false, 
          tier: null, 
          expiresAt: null,
          status: null,
          expiry: null,
          isActive: false,
          isPremium: false,
          isBasicOrHigher: false
        };
      }
      
      const { data, error } = await supabase.functions.invoke('auth-email-handler', {
        body: { 
          action: 'verify-subscription', 
          email: userData.user.email 
        }
      });
      
      if (error) {
        console.error('Error verifying subscription with edge function:', error);
        return { 
          hasSubscription: false, 
          tier: null, 
          expiresAt: null,
          status: null,
          expiry: null,
          isActive: false,
          isPremium: false,
          isBasicOrHigher: false
        };
      }
      
      const tier = data?.tier || null;
      return {
        hasSubscription: data?.hasSubscription || false,
        tier: tier,
        expiresAt: data?.expiresAt || null,
        status: data?.hasSubscription ? 'active' : 'inactive',
        expiry: data?.expiresAt || null,
        isActive: data?.hasSubscription || false,
        isPremium: tier === 'premium',
        isBasicOrHigher: tier === 'basic' || tier === 'premium'
      };
    } catch (error) {
      console.error('Error in subscription verification:', error);
      return { 
        hasSubscription: false, 
        tier: null, 
        expiresAt: null,
        status: null,
        expiry: null,
        isActive: false,
        isPremium: false,
        isBasicOrHigher: false
      };
    }
  } catch (error) {
    console.error('Subscription check failed:', error);
    return { 
      hasSubscription: false, 
      tier: null, 
      expiresAt: null,
      status: null,
      expiry: null,
      isActive: false,
      isPremium: false,
      isBasicOrHigher: false
    };
  }
}

/**
 * Check if a user has access to a particular content type
 * @param userId User ID
 * @param contentType Type of content to check access for
 * @returns Boolean indicating if user has access
 */
export async function checkContentAccess(
  userId: string,
  contentType: 'premium' | 'standard' | 'free'
): Promise<boolean> {
  try {
    // If content is free, always allow access
    if (contentType === 'free') {
      return true;
    }
    
    // For premium or standard content, check subscription
    const subscriptionStatus = await checkUserSubscription(userId);
    
    // If no subscription, deny access to premium and standard content
    if (!subscriptionStatus.hasSubscription) {
      return false;
    }
    
    // Standard subscription can access standard content
    if (contentType === 'standard') {
      return true;
    }
    
    // Premium content requires premium tier
    if (contentType === 'premium') {
      return subscriptionStatus.tier === 'premium';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking content access:', error);
    return false;
  }
}
