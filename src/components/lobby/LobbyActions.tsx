
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { GameSession } from '@/types/database';

interface LobbyActionsProps {
  gameSession: GameSession;
  isCreator: boolean;
  canStartGame: boolean;
  starting: boolean;
  onStartGame: () => Promise<void>;
}

const LobbyActions: React.FC<LobbyActionsProps> = ({
  gameSession,
  isCreator,
  canStartGame,
  starting,
  onStartGame
}) => {
  return (
    <div className="flex justify-center mt-6">
      <Button
        size="lg"
        onClick={onStartGame}
        disabled={!canStartGame || starting}
        className="w-full max-w-xs"
      >
        {starting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
        {isCreator 
          ? (starting ? 'Starting Game...' : 'Start Game') 
          : 'Waiting for host to start...'}
      </Button>
    </div>
  );
};

export default LobbyActions;
