
import React from 'react';
import { cn } from '@/lib/utils';
import { Player } from '@/types/game';
import { ArrowRightCircle, Wand2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlayerInfoProps {
  players: Player[];
  currentPlayer: number;
  onUsePowerup?: (playerId: number, powerupType: string) => void;
  isViewerCurrentPlayer?: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ 
  players, 
  currentPlayer, 
  onUsePowerup,
  isViewerCurrentPlayer = true 
}) => {
  // Function to format player ID for display
  const formatPlayerId = (id: string | number) => {
    if (!id) return 'Guest';
    if (typeof id === 'number') return `Player ${id + 1}`;
    return id.substring(0, 8);
  };

  return (
    <div className="w-full grid grid-cols-2 gap-4 mb-4">
      {players.map((player, index) => (
        <div
          key={`player-${index}`}
          className={cn(
            "glass-panel relative p-3 rounded-lg shadow-sm",
            currentPlayer === index ? "active-player ring-2" : "opacity-90",
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
          
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Score: {player.score}
          </div>
          
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Pieces: {player.pieces.filter(p => !p.used).length}/{player.pieces.length}
          </div>
          
          {/* Display player ID if available */}
          {player.id && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-1 text-xs flex items-center text-gray-500 dark:text-gray-500">
                    <UserCircle className="w-3 h-3 mr-1" />
                    {typeof player.id === 'string' ? player.id.substring(0, 8) : `UUID: ${formatPlayerId(player.id)}`}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {typeof player.id === 'string' ? `Player UUID: ${player.id}` : `Player Number: ${player.id}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Display powerups if player has any */}
          {player.powerups && player.powerups.length > 0 && player.powerups.some(p => p.count > 0) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {player.powerups.map((powerup, pidx) => (
                powerup.count > 0 ? (
                  <div key={`powerup-${pidx}`} className="flex items-center">
                    {isViewerCurrentPlayer && currentPlayer === index && onUsePowerup ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex items-center gap-1"
                        onClick={() => onUsePowerup(index, powerup.type)}
                      >
                        <Wand2 className="h-3 w-3" />
                        {powerup.type} ({powerup.count})
                      </Button>
                    ) : (
                      <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-1">
                        <Wand2 className="h-3 w-3" />
                        {powerup.type} ({powerup.count})
                      </div>
                    )}
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerInfo;
