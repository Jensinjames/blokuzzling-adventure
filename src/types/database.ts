
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

export type GameStatus = 'waiting' | 'active' | 'completed';

export type GameSession = {
  id: string;
  creator_id: string;
  status: GameStatus | string; // Allow string from database but constrain in app logic
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

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type GameInvite = {
  id: string;
  game_id: string;
  sender_id: string;
  recipient_id: string;
  status: InviteStatus | string; // Allow string from database but constrain in app logic
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

// Add new types for powerups
export type PowerupType = 'destroy';

export type Powerup = {
  id: string;
  type: PowerupType;
  position: { row: number; col: number };
  collected: boolean;
  used: boolean;
};
