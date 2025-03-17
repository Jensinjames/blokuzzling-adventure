
import React from 'react';
import { cn } from '@/lib/utils';
import { Player } from '@/types/game';
import { ArrowRightCircle } from 'lucide-react';

interface PlayerInfoProps {
  players: Player[];
  currentPlayer: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ players, currentPlayer }) => {
  return (
    <div className="w-full grid grid-cols-2 gap-4">
      {players.map((player, index) => (
        <div
          key={`player-${index}`}
          className={cn(
            "glass-panel relative",
            currentPlayer === index ? "active-player" : "opacity-90",
            `ring-player${index + 1}`
          )}
        >
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center")}>
              <div
                className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  `bg-player${index + 1}`
                )}
              />
              <p className="text-sm font-medium">{player.name}</p>
            </div>
            {currentPlayer === index && (
              <ArrowRightCircle className="w-4 h-4 text-primary animate-pulse-subtle" />
            )}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Score: {player.score}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Pieces: {player.pieces.filter(p => !p.used).length}/{player.pieces.length}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerInfo;
