
export interface GameSession {
  id: string;
  created_at: string;
  creator_id: string;
  status: 'waiting' | 'active' | 'completed';
  game_state: any | null;
  turn_history: any[] | null;
  max_players: number;
  display_name?: string;
  game_type?: string;
  ai_enabled?: boolean;
  ai_count?: number;
  ai_difficulty?: string;
  current_players: number;
  winner_id?: string;
  creator?: {
    username: string;
    avatar_url?: string | null;
    id?: string;
  };
}

export interface GamePlayer {
  id: string;
  created_at: string;
  game_id: string;
  player_id: string;
  player_number: number;
}

export interface Profile {
  id: string;
  updated_at: string;
  username: string;
  full_name?: string;
  avatar_url?: string | null;
  website?: string;
  wins: number;
  losses: number;
  draws: number;
  created_at?: string;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_expiry?: string;
}

export interface GameInvite {
  id: string;
  created_at: string;
  game_id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  expires_at?: string;
}
