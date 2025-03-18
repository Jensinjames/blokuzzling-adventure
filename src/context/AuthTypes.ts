
import { Session, User } from '@/integrations/supabase/client';

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
};
