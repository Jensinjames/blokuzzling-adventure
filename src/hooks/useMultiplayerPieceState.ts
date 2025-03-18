
import { useState, useEffect } from 'react';
import { Piece, BoardPosition } from '@/types/game';

export const useMultiplayerPieceState = (isMyTurn: boolean) => {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [previewPosition, setPreviewPosition] = useState<BoardPosition | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(false);

  // Reset state when it's not player's turn
  useEffect(() => {
    if (!isMyTurn) {
      setSelectedPiece(null);
      setPreviewPosition(null);
      setIsValidPlacement(false);
    }
  }, [isMyTurn]);

  return {
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement
  };
};
