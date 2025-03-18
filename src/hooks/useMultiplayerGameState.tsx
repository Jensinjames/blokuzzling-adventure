
import { useState } from 'react';
import { GameState, BoardPosition, Piece } from '@/types/game';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { useMultiplayerPieceState } from '@/hooks/useMultiplayerPieceState';
import { useMultiplayerPowerups } from '@/hooks/useMultiplayerPowerups';
import { toast } from 'sonner';

export function useMultiplayerGameState(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
  updateGameState: (newState: GameState) => void,
  isMyTurn: boolean
) {
  // Initialize piece state
  const {
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement
  } = useMultiplayerPieceState(isMyTurn);

  // Initialize powerup state
  const {
    isPowerupActive,
    setIsPowerupActive,
    activePowerupType,
    setActivePowerupType,
    handlePlayerUsePowerup,
    cancelPowerupMode
  } = useMultiplayerPowerups(isMyTurn);

  const handleSetGameState = (newState: GameState) => {
    setGameState(newState);
    if (isMyTurn) {
      updateGameState(newState);
    }
    return true;
  };

  const {
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handlePassTurn
  } = usePieceActions(
    gameState || { 
      board: [], 
      players: [], 
      currentPlayer: 0, 
      turnHistory: [], 
      gameStats: { totalMoves: 0, gameStartTime: 0, lastMoveTime: 0 }, 
      gameStatus: 'playing', 
      winner: null 
    },
    handleSetGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    setIsValidPlacement
  );

  const {
    handleCellClick,
    handleUndo,
    handleUsePowerup
  } = useBoardActions(
    gameState || { 
      board: [], 
      players: [], 
      currentPlayer: 0, 
      turnHistory: [], 
      gameStats: { totalMoves: 0, gameStartTime: 0, lastMoveTime: 0 }, 
      gameStatus: 'playing', 
      winner: null 
    },
    handleSetGameState,
    selectedPiece,
    setSelectedPiece,
    setPreviewPosition,
    setIsValidPlacement,
    isPowerupActive,
    setIsPowerupActive
  );

  const handleReset = () => {
    toast.info('Game reset is not available in multiplayer mode');
  };

  const handlePlayerUsePowerupWithGameState = (playerId: number, powerupType: string) => {
    if (gameState) {
      handlePlayerUsePowerup(playerId, gameState.currentPlayer, powerupType);
      
      if (!isPowerupActive) {
        handleUsePowerup(powerupType);
      }
    }
  };

  return {
    // Piece state
    selectedPiece,
    previewPosition,
    isValidPlacement,
    
    // Powerup state
    isPowerupActive,
    activePowerupType,
    
    // Action handlers
    handleCellClick,
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handleUndo,
    handleReset,
    handlePassTurn,
    handlePlayerUsePowerupWithGameState,
    cancelPowerupMode
  };
}
