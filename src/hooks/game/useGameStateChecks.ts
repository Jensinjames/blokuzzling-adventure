
import { useEffect } from 'react';
import { GameState } from '@/types/game';
import { hasValidMoves } from '@/utils/gameLogic';
import { toast } from 'sonner';

// Helper function to calculate player scores based on remaining pieces
export const calculateFinalScores = (players: GameState['players']): GameState['players'] => {
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

export function useGameStateChecks(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  gameStarted: boolean,
  lastPassPlayer: number | null,
  setLastPassPlayer: React.Dispatch<React.SetStateAction<number | null>>,
  handlePassTurn: () => void
) {
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
  }, [gameState.turnHistory, gameStarted, lastPassPlayer]);

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

  // Helper function to check if game is over
  const isGameOver = (): boolean => {
    return gameState.gameStatus === "finished" || gameState.gameStatus === "completed";
  };

  return {
    isGameOver
  };
}
