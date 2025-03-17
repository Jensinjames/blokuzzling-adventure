
import React from 'react';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { Button } from '@/components/ui/button';
import AIDifficultySelector from '@/components/AIDifficultySelector';

interface GameSetupProps {
  aiDifficulty: AIDifficulty;
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  onStartGame: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({
  aiDifficulty,
  onSelectDifficulty,
  onStartGame
}) => {
  return (
    <div className="glass-panel p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Choose AI Difficulty</h2>
      
      <AIDifficultySelector 
        difficulty={aiDifficulty} 
        onSelectDifficulty={onSelectDifficulty}
        className="mb-6"
      />
      
      <Button 
        className="w-full" 
        size="lg"
        onClick={onStartGame}
      >
        Start Game
      </Button>
    </div>
  );
};

export default GameSetup;
