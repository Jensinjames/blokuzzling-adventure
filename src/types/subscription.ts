
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro' | null;
export type SubscriptionStatusType = 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled' | null;

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: SubscriptionStatusType;
  isActive: boolean;
  isPremium: boolean;
  isBasicOrHigher: boolean;
  expiry: string | null;
  hasSubscription: boolean;
  expiresAt: Date | null;
}

// For backward compatibility
export type SubscriptionDetails = SubscriptionStatus;

// Default subscription state for unauthenticated users
export const defaultSubscription: SubscriptionStatus = {
  tier: null,
  status: null,
  isActive: false,
  isPremium: false,
  isBasicOrHigher: false,
  expiry: null,
  hasSubscription: false,
  expiresAt: null
};
