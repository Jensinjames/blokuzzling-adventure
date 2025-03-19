
export interface SubscriptionDetails {
  tier: string | null;
  status: string | null;
  expiry: string | null;
  isActive: boolean;
  isPremium: boolean;
  isBasicOrHigher: boolean;
}

export interface SubscriptionCheckResult {
  hasSubscription: boolean | null;
  checkingSubscription: boolean;
  subscriptionDetails: {
    tier: string | null;
    status: string | null;
    expiry: string | null;
  };
}
