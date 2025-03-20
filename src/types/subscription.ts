
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
}
