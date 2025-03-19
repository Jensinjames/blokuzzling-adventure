
export interface SubscriptionDetails {
  tier: string | null;
  status: string | null;
  isActive: boolean;
  isPremium: boolean;
  isBasicOrHigher: boolean;
  expiry: string | null;
}
