
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { GameSession } from '@/types/database';
import GameSessionItem from './GameSessionItem';

interface UserGamesSectionProps {
  userSessions: GameSession[];
  onView: (gameId: string) => void;
  onPlay: (gameId: string) => void;
}

const UserGamesSection: React.FC<UserGamesSectionProps> = ({
  userSessions,
  onView,
  onPlay
}) => {
  if (userSessions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Trophy className="h-5 w-5 mr-2 text-primary" />
        Your Active Games
      </h2>

      <div className="space-y-3">
        {userSessions.map((session) => (
          <GameSessionItem
            key={session.id}
            session={session}
            onView={onView}
            onPlay={onPlay}
            onJoin={() => {}} // Not used for user sessions
            isUserSession={true}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default UserGamesSection;
