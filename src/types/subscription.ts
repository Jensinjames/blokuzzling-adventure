
export interface SubscriptionDetails {
  tier: string | null;
  status: string | null;
  expiry: string | null;
  isActive: boolean;
  isPremium: boolean;
  isBasicOrHigher: boolean;
}
