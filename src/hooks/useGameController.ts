
import { useState, useEffect } from 'react';
import { Player, Piece, BoardPosition, GameState } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { usePieceActions } from '@/hooks/usePieceActions';
import { useBoardActions } from '@/hooks/useBoardActions';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { toast } from 'sonner';
import { hasValidMoves } from '@/utils/gameLogic';

// Helper function to calculate player scores based on remaining pieces
const calculateFinalScores = (players: GameState['players']): GameState['players'] => {
  return players.map(player => {
    const unusedPieces = player.pieces.filter(p => !p.used);
    // Score is 89 (total of all piece cells) minus remaining pieces' cells
    let remainingCellCount = 0;
    for (const piece of unusedPieces) {
      if (piece.shape) {
        remainingCellCount += piece.shape.flat().filter(cell => cell === 1).length;
      }
    }
    return {
      ...player,
      score: 89 - remainingCellCount // 89 is the total number of cells in all pieces
    };
  });
};

export function useGameController(numPlayers: number = 2) {
  const [isPowerupActive, setIsPowerupActive] = useState(false);
  const [activePowerupType, setActivePowerupType] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [lastPassPlayer, setLastPassPlayer] = useState<number | null>(null);
  
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

  // Check for consecutive passes to end the game
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameStarted) return;
    
    const lastMove = gameState.turnHistory[gameState.turnHistory.length - 1];
    if (lastMove && lastMove.type === 'pass') {
      if (lastPassPlayer !== null && lastPassPlayer !== lastMove.player) {
        // Two different players passed consecutively, game should end
        const updatedPlayers = calculateFinalScores(gameState.players);
        
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
          toast.error("AI won the game. Better luck next time!");
        } else {
          toast.info("The game ended in a tie!");
        }
      } else {
        // Update lastPassPlayer to current player
        setLastPassPlayer(lastMove.player);
      }
    } else if (lastMove && lastMove.type !== 'pass') {
      // Reset lastPassPlayer when a non-pass move is made
      setLastPassPlayer(null);
    }
  }, [gameState.turnHistory]);

  // Check for game end conditions after each move
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameStarted) return;
    
    // Check if both players have no valid moves left
    const player0HasMoves = hasValidMoves(gameState, 0);
    const player1HasMoves = hasValidMoves(gameState, 1);
    
    if (!player0HasMoves && !player1HasMoves) {
      // Game is over, calculate final scores
      const updatedPlayers = calculateFinalScores(gameState.players);
      
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
      toast.info("You have no valid moves. Passing turn.");
      handlePassTurn();
    }
  }, [gameState.board, gameState.currentPlayer, gameStarted]);

  // Start the game with the selected settings
  const handleStartGame = () => {
    // Reset the game with current settings
    initGame();
    setGameStarted(true);
    setLastPassPlayer(null);
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
    initGame,
    setGameState
  };
}
