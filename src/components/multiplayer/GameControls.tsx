
import React from 'react';
import { toast } from 'sonner';
import GameControls from '@/components/GameControls';

interface MultiplayerGameControlsProps {
  isMyTurn: boolean;
  turnHistoryLength: number;
  gameStatus: string;
  onUndo: () => void;
  onReset: () => void;
  onPass: () => void;
  onHome: () => void;
}

const MultiplayerGameControls: React.FC<MultiplayerGameControlsProps> = ({
  isMyTurn,
  turnHistoryLength,
  gameStatus,
  onUndo,
  onReset,
  onPass,
  onHome
}) => {
  const handlePass = () => {
    if (!isMyTurn) {
      toast.info("It's not your turn");
      return;
    }
    onPass();
  };

  return (
    <div className="mt-4">
      <GameControls
        onUndo={onUndo}
        onReset={onReset}
        onPass={isMyTurn ? onPass : handlePass}
        onHome={onHome}
        canUndo={isMyTurn && turnHistoryLength > 0}
        isGameOver={["finished", "completed"].includes(gameStatus)}
      />
    </div>
  );
};

export default MultiplayerGameControls;
