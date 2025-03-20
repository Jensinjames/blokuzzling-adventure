
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro' | null;
export type SubscriptionStatusType = 'active' | 'inactive' | 'trial' | 'expired' | 'canceled' | 'pending' | null;

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

// Default subscription for non-authenticated users
export const defaultSubscription: SubscriptionStatus = {
  tier: 'free',
  status: 'inactive',
  isActive: false,
  isPremium: false,
  isBasicOrHigher: false,
  expiry: null,
  hasSubscription: false,
  expiresAt: null
};

// Alias for backward compatibility if needed
export type SubscriptionDetails = SubscriptionStatus;
