
import { Session, User } from '@supabase/supabase-js';

export interface SubscriptionInfo {
  tier: string | null;
  status: string | null;
  isActive: boolean;
  isPremium: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any | null; error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any | null; error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  subscription: SubscriptionInfo;
}
