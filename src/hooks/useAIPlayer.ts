
import { useEffect, useState } from 'react';
import { GameState } from '@/types/game';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { hasValidMoves } from '@/utils/gameLogic';
import { toast } from 'sonner';
import { useAIThinking } from './ai/useAIThinking';
import { useAIMoves } from './ai/useAIMoves';
import { useAIPass } from './ai/useAIPass';

export function useAIPlayer(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  aiPlayerIndex: number,
  difficulty: AIDifficulty = 'medium',
  aiEnabled: boolean = true
) {
  const { 
    isAIThinking, 
    setIsAIThinking, 
    aiDifficulty, 
    setAiDifficulty,
    getThinkingTime 
  } = useAIThinking(difficulty);
  
  const { findAndMakeMove } = useAIMoves();
  const { handleAIPass } = useAIPass();
  const [lastPassPlayer, setLastPassPlayer] = useState<number | null>(null);
  const humanPlayerIndex = 0; // Assuming human is always player 0

  // Check for consecutive passes to end the game
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    const lastMove = gameState.turnHistory[gameState.turnHistory.length - 1];
    if (lastMove && lastMove.type === 'pass') {
      if (lastPassPlayer !== null && lastPassPlayer !== lastMove.player) {
        // Two different players passed consecutively, game should end
        const updatedPlayers = gameState.players.map(player => {
          const unusedPieces = player.pieces.filter(p => !p.used);
          let remainingCellCount = 0;
          for (const piece of unusedPieces) {
            remainingCellCount += piece.shape.flat().filter(cell => cell === 1).length;
          }
          return {
            ...player,
            score: 89 - remainingCellCount
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
        if (winner === humanPlayerIndex) {
          toast.success("Congratulations! You've won the game!");
        } else if (winner === aiPlayerIndex) {
          toast.error("AI won the game. Better luck next time!");
        } else {
          toast.info("The game ended in a tie!");
        }
      } else {
        // Update lastPassPlayer to current player
        setLastPassPlayer(lastMove.player);
      }
    } else if (lastMove && lastMove.type !== 'pass') {
      // Reset lastPassPlayer when a move is made
      setLastPassPlayer(null);
    }
  }, [gameState.turnHistory]);

  useEffect(() => {
    if (!aiEnabled) return;
    
    // Check if it's the AI's turn
    if (gameState.currentPlayer === aiPlayerIndex && gameState.gameStatus === 'playing') {
      handleAITurn();
    }
  }, [gameState.currentPlayer, gameState.gameStatus, aiEnabled]);

  const handleAITurn = async () => {
    // Set AI as thinking to prevent multiple moves
    setIsAIThinking(true);
    
    try {
      // Add a small delay to make it feel more natural
      const thinkingTime = getThinkingTime(aiDifficulty);
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      // Check if AI has valid moves
      const hasValidMovesAvailable = hasValidMoves(gameState, aiPlayerIndex);
      
      if (!hasValidMovesAvailable) {
        // No valid moves, AI needs to pass
        handleAIPass(gameState, aiPlayerIndex, humanPlayerIndex, setGameState);
        return;
      }
      
      // Find and make the best move
      const moveMade = findAndMakeMove(gameState, aiPlayerIndex, aiDifficulty, setGameState);
      
      if (!moveMade) {
        // No valid moves were found (fallback for safety)
        handleAIPass(gameState, aiPlayerIndex, humanPlayerIndex, setGameState);
      }
    } finally {
      setIsAIThinking(false);
    }
  };

  return {
    isAIThinking,
    aiDifficulty,
    setAiDifficulty
  };
}
