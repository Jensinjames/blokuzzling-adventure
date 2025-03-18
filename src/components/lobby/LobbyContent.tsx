
import React from 'react';
import { motion } from 'framer-motion';
import { GameSession } from '@/types/database';
import { Profile, GamePlayer } from '@/types/database';
import LobbyInfo from './LobbyInfo';
import PlayerList from './PlayerList';
import AIPlayersToggle from './AIPlayersToggle';
import InviteForm from './InviteForm';
import { AIDifficulty } from '@/utils/ai/aiTypes';

interface LobbyContentProps {
  gameSession: GameSession;
  players: (GamePlayer & { profile: Profile })[];
  isCreator: boolean;
  userId: string | undefined;
  gameId: string | undefined;
  aiEnabled: boolean;
  aiCount: number;
  aiDifficulty: AIDifficulty;
  maxAIPlayers: number;
  setAiEnabled: (enabled: boolean) => void;
  setAiCount: (count: number) => void;
  setAiDifficulty: (difficulty: AIDifficulty) => void;
}

const LobbyContent: React.FC<LobbyContentProps> = ({
  gameSession,
  players,
  isCreator,
  userId,
  gameId,
  aiEnabled,
  aiCount,
  aiDifficulty,
  maxAIPlayers,
  setAiEnabled,
  setAiCount,
  setAiDifficulty,
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <LobbyInfo gameSession={gameSession} />
        <PlayerList 
          players={players} 
          maxPlayers={gameSession.max_players} 
          creatorId={gameSession.creator_id} 
        />
      </motion.div>

      {isCreator && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
        >
          <AIPlayersToggle
            aiEnabled={aiEnabled}
            aiCount={aiCount}
            aiDifficulty={aiDifficulty}
            maxAIPlayers={maxAIPlayers}
            onToggleAI={setAiEnabled}
            onChangeAICount={setAiCount}
            onChangeDifficulty={setAiDifficulty}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel"
      >
        <InviteForm gameId={gameId || ''} userId={userId} />
      </motion.div>
    </div>
  );
};

export default LobbyContent;
