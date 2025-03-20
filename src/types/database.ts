
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
  current_players: number; // Added to match usage in code
  winner_id?: string; // Added to match usage in code
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
  wins: number; // Added to match usage in code
  losses: number; // Added to match usage in code
  draws: number; // Added to match usage in code
  created_at?: string;
}

export interface GameInvite {
  id: string;
  created_at: string;
  game_id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string; // Added to match usage in code
  sender?: { // Added sender profile relation
    id: string;
    username: string;
    avatar_url?: string;
  };
}
