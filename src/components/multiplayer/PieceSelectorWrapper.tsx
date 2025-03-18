
import React from 'react';
import PieceSelector from '@/components/PieceSelector';
import { Piece } from '@/types/game';

interface PieceSelectorWrapperProps {
  isMyTurn: boolean;
  isPowerupActive: boolean;
  playerNumber: number | null;
  pieces: Piece[];
  selectedPiece: Piece | null;
  onSelectPiece: (piece: Piece) => void;
  onRotatePiece: () => void;
  onFlipPiece: () => void;
}

const PieceSelectorWrapper: React.FC<PieceSelectorWrapperProps> = ({
  isMyTurn,
  isPowerupActive,
  playerNumber,
  pieces,
  selectedPiece,
  onSelectPiece,
  onRotatePiece,
  onFlipPiece
}) => {
  if (!isMyTurn || isPowerupActive) {
    return null;
  }

  return (
    <PieceSelector
      pieces={pieces}
      currentPlayer={playerNumber || 0}
      onSelectPiece={onSelectPiece}
      onRotatePiece={onRotatePiece}
      onFlipPiece={onFlipPiece}
      selectedPiece={selectedPiece}
    />
  );
};

export default PieceSelectorWrapper;
