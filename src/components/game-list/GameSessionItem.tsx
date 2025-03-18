
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Clock, User } from 'lucide-react';
import { GameSession } from '@/types/database';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/integrations/supabase/client';

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
  // Safely extract creator info if available
  const creatorName = session.creator?.username || 'Unknown';
  const creatorAvatar = session.creator?.avatar_url || null;
  
  // Get avatar URL or use initials
  const avatarUrl = getAvatarUrl(creatorAvatar);
  const initials = creatorName.substring(0, 2).toUpperCase();

  return (
    <div
      key={session.id}
      className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Game {session.id.substr(0, 8)}
            </span>
            {session.status && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                session.status === 'waiting'
                  ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                  : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
              }`}>
                {session.status === 'waiting' ? 'Waiting' : 'Active'}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Users className="h-3 w-3 inline mr-1" />
            <span className="mr-3">{session.current_players}/{session.max_players} players</span>
            
            {!isUserSession && (
              <div className="flex items-center">
                <User className="h-3 w-3 inline mr-1" />
                <span className="flex items-center">
                  <Avatar className="h-4 w-4 mr-1">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={creatorName} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  {creatorName}
                </span>
              </div>
            )}
            
            {isUserSession ? (
              <div className="ml-auto">
                <Calendar className="h-3 w-3 inline mr-1" />
                <span>{new Date(session.created_at).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="ml-auto">
                <Clock className="h-3 w-3 inline mr-1" />
                <span>{new Date(session.created_at).toLocaleTimeString()}</span>
              </div>
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
