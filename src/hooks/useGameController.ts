
import { useEffect } from 'react';
import { Player, Piece, BoardPosition, GameState } from '@/types/game';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { useGameInitialization } from '@/hooks/game/useGameInitialization';
import { usePowerupController } from '@/hooks/game/usePowerupController';
import { useGameStateChecks } from '@/hooks/game/useGameStateChecks';
import { toast } from 'sonner';

export function useGameController(numPlayers: number = 2) {
  // Initialize game state and settings
  const {
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    initGame,
    gameStarted,
    setGameStarted,
    aiDifficulty,
    setAiDifficulty,
    lastPassPlayer,
    setLastPassPlayer,
    handleStartGame,
    handleSelectDifficulty
  } = useGameInitialization(numPlayers);

  // Initialize piece actions
  const {
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handlePassTurn
  } = usePieceActions(
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    setIsValidPlacement
  );

  // Initialize powerup controller
  const {
    isPowerupActive,
    setIsPowerupActive,
    activePowerupType,
    setActivePowerupType,
    handlePlayerUsePowerup: basePowerupHandler,
    cancelPowerupMode
  } = usePowerupController();

  // Wrap powerup handler to include gameState
  const handlePlayerUsePowerup = (playerId: number, powerupType: string) => {
    basePowerupHandler(gameState, playerId, powerupType);
  };

  // Initialize board actions
  const {
    handleCellClick,
    handleUndo,
    handleUsePowerup
  } = useBoardActions(
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    setPreviewPosition,
    setIsValidPlacement,
    isPowerupActive,
    setIsPowerupActive
  );

  // Initialize game state checks
  const {
    isGameOver
  } = useGameStateChecks(
    gameState,
    setGameState,
    gameStarted,
    lastPassPlayer,
    setLastPassPlayer,
    handlePassTurn
  );

  // AI Player hooks (only for player 1 in a 2-player game)
  const {
    isAIThinking
  } = useAIPlayer(
    gameState,
    setGameState,
    1, // AI is always player 2 (index 1)
    aiDifficulty,
    gameStarted && numPlayers === 2 // Only enable AI in 2-player games
  );

  // Handle actual powerup activation
  useEffect(() => {
    if (isPowerupActive && activePowerupType) {
      handleUsePowerup(activePowerupType);
    }
  }, [isPowerupActive, activePowerupType]);

  return {
    gameState,
    selectedPiece,
    previewPosition,
    isValidPlacement,
    isPowerupActive,
    activePowerupType,
    isAIThinking,
    gameStarted,
    aiDifficulty,
    handleCellClick,
    handleCellHover,
    handleSelectPiece,
    handleRotatePiece,
    handleFlipPiece,
    handleUndo,
    handlePassTurn,
    handleStartGame,
    handleSelectDifficulty,
    handlePlayerUsePowerup,
    cancelPowerupMode,
    isGameOver,
    initGame,
    setGameState
  };
}
