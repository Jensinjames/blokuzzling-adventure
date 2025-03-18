
import { useGameData } from './useGameData';
import { useGameStateManager } from './useGameStateManager';
import { useGameCompletion } from './useGameCompletion';
import { useAIMoves } from './ai/useAIMoves';
import { useEffect } from 'react';
import { BoardPosition, Piece, GameState } from '@/types/game';
import { AIDifficulty } from '@/utils/ai/aiTypes';

export function useMultiplayerGame(gameId: string) {
  const {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber
  } = useGameData(gameId);

  const {
    isMyTurn,
    updateGameState,
    makeMove
  } = useGameStateManager(gameId, gameState, playerNumber);

  // AI moves integration
  const { findAndMakeMove } = useAIMoves();

  // Process AI turns
  useEffect(() => {
    // Only proceed if game is loaded and in playing state
    if (!gameState || loading || gameState.gameStatus !== 'playing') {
      return;
    }

    // Check if it's an AI player's turn
    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.isAI) {
      // Small delay to make AI moves feel more natural
      const aiTimer = setTimeout(() => {
        // Make the AI move
        const aiDifficulty = currentPlayer.aiDifficulty || 'medium';
        const aiSuccess = findAndMakeMove(
          gameState, 
          gameState.currentPlayer, 
          aiDifficulty as AIDifficulty, 
          setGameState
        );

        // If AI made a move, update the game state
        if (aiSuccess && gameState) {
          updateGameState(gameState);
        } else {
          // AI couldn't make a move, so pass the turn
          const updatedGameState = {
            ...gameState,
            currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length,
            turnHistory: [
              ...gameState.turnHistory,
              {
                type: 'pass',
                player: gameState.currentPlayer,
                timestamp: Date.now()
              }
            ]
          };
          setGameState(updatedGameState);
          updateGameState(updatedGameState);
        }
      }, 1000); // 1 second delay for AI thinking

      return () => clearTimeout(aiTimer);
    }
  }, [gameState?.currentPlayer, gameState?.gameStatus, loading]);

  // Use useGameCompletion with the correct parameters
  useGameCompletion(
    gameState || { 
      board: [], 
      players: [], 
      currentPlayer: 0, 
      turnHistory: [], 
      gameStats: { totalMoves: 0, gameStartTime: 0, lastMoveTime: 0 }, 
      gameStatus: 'playing', 
      winner: null 
    },
    setGameState
  );

  return {
    gameSession,
    players,
    gameState,
    setGameState,
    loading,
    playerNumber,
    isMyTurn,
    updateGameState,
    makeMove
  };
}
