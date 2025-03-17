
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { GamePlayer, Profile } from '@/types/database';

interface PlayerListProps {
  players: (GamePlayer & { profile: Profile })[];
  maxPlayers: number;
  creatorId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, maxPlayers, creatorId }) => {
  return (
    <div className="space-y-3 mt-4">
      {players.map((player, index) => (
        <div
          key={player.id}
          className="flex items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className={`bg-player${index + 1}`}>
              {player.profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {player.profile.username}
              {player.player_id === creatorId && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                  Host
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Player {index + 1}
            </p>
          </div>
        </div>
      ))}

      {Array.from({ length: maxPlayers - players.length }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="flex items-center p-3 bg-gray-100/50 dark:bg-gray-700/20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-400 dark:text-gray-500">Waiting for player...</p>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
