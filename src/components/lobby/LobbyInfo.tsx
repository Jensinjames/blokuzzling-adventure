
import React from 'react';
import { Clock, Users } from 'lucide-react';
import { GameSession } from '@/types/database';

interface LobbyInfoProps {
  gameSession: GameSession;
}

const LobbyInfo: React.FC<LobbyInfoProps> = ({ gameSession }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center text-primary">
        <Users className="h-5 w-5 mr-2" />
        <h2 className="font-semibold">
          Players ({gameSession.current_players}/{gameSession.max_players})
        </h2>
      </div>
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <Clock className="h-4 w-4 mr-1" />
        <span>
          Created {new Date(gameSession.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default LobbyInfo;
