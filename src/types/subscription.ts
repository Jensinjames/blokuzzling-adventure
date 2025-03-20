
/**
 * Represents a user's subscription status
 */
export interface SubscriptionStatus {
  /**
   * Whether the user has an active subscription
   */
  hasSubscription: boolean;
  
  /**
   * The subscription tier (standard, premium, etc.)
   */
  tier: string | null;
  
  /**
   * When the subscription expires (if applicable)
   */
  expiresAt: string | null;

  /**
   * Current status of the subscription (active, cancelled, expired)
   */
  status: string | null;
  
  /**
   * Alias for expiresAt with a different name for backward compatibility
   */
  expiry: string | null;
  
  /**
   * Whether the subscription is currently active
   */
  isActive: boolean;
  
  /**
   * Whether the subscription is premium tier
   */
  isPremium: boolean;
  
  /**
   * Whether the subscription is basic tier or higher
   */
  isBasicOrHigher: boolean;
}

// For backward compatibility
export type SubscriptionDetails = SubscriptionStatus;
