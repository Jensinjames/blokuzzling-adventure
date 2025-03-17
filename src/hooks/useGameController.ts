
import { useState, useEffect } from 'react';
import { Player, Piece, BoardPosition, GameState } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { toast } from 'sonner';
import { hasValidMoves } from '@/utils/gameLogic';

export function useGameController(numPlayers: number = 2) {
  const [isPowerupActive, setIsPowerupActive] = useState(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  
  const {
    gameState,
    setGameState,
    selectedPiece,
    setSelectedPiece,
    previewPosition,
    setPreviewPosition,
    isValidPlacement,
    setIsValidPlacement,
    initGame
  } = useGameState(numPlayers);

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

  // Check for game end conditions after each move
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameStarted) return;
    
    // Check if both players have no valid moves left
    const player0HasMoves = hasValidMoves(gameState, 0);
    const player1HasMoves = hasValidMoves(gameState, 1);
    
    if (!player0HasMoves && !player1HasMoves) {
      // Game is over, calculate final scores
      const updatedPlayers = [...gameState.players].map(player => {
        const unusedPiecesCount = player.pieces.filter(p => !p.used).length;
        return {
          ...player,
          score: 55 - unusedPiecesCount // Total pieces (55) minus remaining pieces
        };
      });
      
      // Determine winner based on highest score
      const winner = updatedPlayers[0].score > updatedPlayers[1].score ? 0 : 
                    updatedPlayers[0].score < updatedPlayers[1].score ? 1 : null;
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner
      }));
      
      // Show appropriate notification
      if (winner === 0) {
        toast.success("Congratulations! You've won the game!");
      } else if (winner === 1) {
        toast.error("You've lost the game. Better luck next time!");
      } else {
        toast.info("The game ended in a tie!");
      }
    } else if (!player0HasMoves && gameState.currentPlayer === 0) {
      // Human player has no moves, needs to pass
      handlePassTurn();
    }
  }, [gameState.board, gameState.currentPlayer, gameStarted]);

  // Start the game with the selected settings
  const handleStartGame = () => {
    // Reset the game with current settings
    initGame();
    setGameStarted(true);
    toast.success(`Game started with ${aiDifficulty} AI difficulty`);
  };

  // Handle AI difficulty selection
  const handleSelectDifficulty = (difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
  };

  // Handler for using powerup from player info card
  const handlePlayerUsePowerup = (playerId: number, powerupType: string) => {
    if (playerId !== gameState.currentPlayer) {
      toast.error("You can only use your own powerups during your turn");
      return;
    }
    
    if (isPowerupActive) {
      setIsPowerupActive(false);
      setActivePowerupType(null);
      toast.info("Powerup mode cancelled");
    } else {
      setActivePowerupType(powerupType);
      handleUsePowerup(powerupType);
    }
  };

  const cancelPowerupMode = () => {
    setIsPowerupActive(false);
    setActivePowerupType(null);
    toast.info("Powerup mode cancelled");
  };

  // Helper function to check if game is over
  const isGameOver = (): boolean => {
    return gameState.gameStatus === "finished" || gameState.gameStatus === "completed";
  };

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
    initGame
  };
}
