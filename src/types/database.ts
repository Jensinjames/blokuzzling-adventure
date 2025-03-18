export interface GameSession {
  id: string;
  created_at: string;
  creator_id: string;
  status: 'waiting' | 'active' | 'completed';
  game_state: any | null;
  turn_history: any[] | null;
  max_players: number;
  display_name: string;
  game_type: string;
  ai_enabled?: boolean;
  ai_count?: number;
  ai_difficulty?: string;
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
  full_name: string;
  avatar_url: string;
  website: string;
}

export interface GameInvite {
  id: string;
  created_at: string;
  game_id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}
