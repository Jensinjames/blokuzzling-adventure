
import React from 'react';
import { toast } from 'sonner';
import { GameState, BoardPosition } from '@/types/game';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';

interface MultiplayerGameBoardProps {
  gameState: GameState;
  isMyTurn: boolean;
  isPowerupActive: boolean;
  selectedPiece: any;
  previewPosition: BoardPosition | null;
  isValidPlacement: boolean;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
}

const MultiplayerGameBoard: React.FC<MultiplayerGameBoardProps> = ({
  gameState,
  isMyTurn,
  isPowerupActive,
  selectedPiece,
  previewPosition,
  isValidPlacement,
  onCellClick,
  onCellHover
}) => {
  // Helper function to handle board cell clicks
  const handleBoardCellClick = (position: BoardPosition) => {
    if (!isMyTurn) {
      toast.info("It's not your turn");
      return;
    }
    onCellClick(position);
  };

  return (
    <GameBoard
      gameState={gameState}
      size={BOARD_SIZE}
      onCellClick={handleBoardCellClick}
      selectedPiecePreview={isPowerupActive ? null : selectedPiece}
      previewPosition={previewPosition}
      isValidPlacement={isValidPlacement && isMyTurn}
      onCellHover={onCellHover}
      isPowerupActive={isPowerupActive}
    />
  );
};

export default MultiplayerGameBoard;
