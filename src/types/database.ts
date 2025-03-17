
export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  wins: number;
  losses: number;
  draws: number;
};

export type GameSession = {
  id: string;
  creator_id: string;
  status: 'waiting' | 'active' | 'completed';
  max_players: number;
  current_players: number;
  game_state: any;
  turn_history: any[];
  created_at: string;
  updated_at: string;
  winner_id: string | null;
};

export type GamePlayer = {
  id: string;
  game_id: string;
  player_id: string;
  player_number: number;
  joined_at: string;
  profile?: Profile;
};

export type GameInvite = {
  id: string;
  game_id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  updated_at: string;
  sender?: Profile;
  recipient?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
};
