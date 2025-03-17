
import React from 'react';
import { Player } from '@/types/game';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameResultProps {
  players: Player[];
  winner: number | null;
  onRestart: () => void;
  onHome: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ players, winner, onRestart, onHome }) => {
  // Sort players by score for ranking
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel w-full max-w-md mx-auto text-center py-6"
    >
      <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
      
      {winner !== null ? (
        <p className="mb-4">
          <span className={cn(
            "text-lg font-medium",
            `text-player${winner + 1}`
          )}>
            {players[winner].name}
          </span> won the game!
        </p>
      ) : (
        <p className="mb-4">It's a tie!</p>
      )}
      
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium">Final Rankings</h3>
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <motion.div 
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                index === 0 && "bg-yellow-50 border border-yellow-200"
              )}
            >
              <div className="flex items-center">
                <span className="font-bold mr-2">{index + 1}.</span>
                <div className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  `bg-player${player.id + 1}`
                )} />
                <span className="font-medium">{player.name}</span>
              </div>
              <span className="font-bold">{player.score}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-3 justify-center">
        <Button
          onClick={onRestart}
          className="control-button"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Play Again
        </Button>
        
        <Button
          variant="outline"
          onClick={onHome}
          className="control-button"
        >
          <Home className="h-4 w-4 mr-2" />
          Main Menu
        </Button>
      </div>
    </motion.div>
  );
};

export default GameResult;
