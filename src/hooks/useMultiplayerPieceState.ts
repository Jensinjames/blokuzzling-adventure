
import { useState, useEffect } from 'react';
import { Piece, BoardPosition } from '@/types/game';

export const useMultiplayerPieceState = (isMyTurn: boolean) => {
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [previewPosition, setPreviewPosition] = useState<BoardPosition | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState<boolean>(false);
  const [lastRotation, setLastRotation] = useState<number>(0);
  const [lastFlipState, setLastFlipState] = useState<boolean>(false);

  // Track piece state changes for performance optimizations
  useEffect(() => {
    if (selectedPiece) {
      setLastRotation(selectedPiece.rotation || 0);
      setLastFlipState(selectedPiece.flipped || false);
    }
  }, [selectedPiece]);

  // Reset state when it's not player's turn
  useEffect(() => {
    if (!isMyTurn) {
      setSelectedPiece(null);
      setPreviewPosition(null);
      setIsValidPlacement(false);
    }
  }, [isMyTurn]);

  // Enhanced setSelectedPiece that preserves rotation and flip state
  const setSelectedPieceWithState = (piece: Piece | null) => {
    if (piece) {
      setSelectedPiece({
        ...piece,
        rotation: piece.rotation || 0,
        flipped: piece.flipped || false
      });
    } else {
      setSelectedPiece(null);
    }
  };

  return {
    selectedPiece,
    setSelectedPiece: setSelectedPieceWithState,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    lastRotation,
    lastFlipState
  };
};
