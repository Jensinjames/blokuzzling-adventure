
import { Session, User } from '@/integrations/supabase/client';
import { SubscriptionDetails } from '@/types/subscription';

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  subscription: SubscriptionDetails;
  checkingSubscription: boolean;
  hasSubscription: boolean | null;
};
