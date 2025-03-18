
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Clock } from 'lucide-react';
import { GameSession } from '@/types/database';

interface GameSessionItemProps {
  session: GameSession;
  onView: (gameId: string) => void;
  onPlay: (gameId: string) => void;
  onJoin: (gameId: string) => void;
  isUserSession: boolean;
}

const GameSessionItem: React.FC<GameSessionItemProps> = ({
  session,
  onView,
  onPlay,
  onJoin,
  isUserSession
}) => {
  return (
    <div
      key={session.id}
      className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">
            Game {session.id.substr(0, 8)}
            {isUserSession && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                session.status === 'waiting'
                  ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                  : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
              }`}>
                {session.status === 'waiting' ? 'Waiting' : 'Active'}
              </span>
            )}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Users className="h-3 w-3 inline mr-1" />
            <span className="mr-3">{session.current_players}/{session.max_players} players</span>
            {isUserSession ? (
              <>
                <Calendar className="h-3 w-3 inline mr-1" />
                <span>{new Date(session.created_at).toLocaleDateString()}</span>
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 inline mr-1" />
                <span>{new Date(session.created_at).toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
        {isUserSession ? (
          <Button
            size="sm"
            onClick={() => session.status === 'waiting' 
              ? onView(session.id) 
              : onPlay(session.id)
            }
          >
            {session.status === 'waiting' ? 'View' : 'Play'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onJoin(session.id)}
            disabled={session.current_players >= session.max_players}
          >
            Join
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameSessionItem;
