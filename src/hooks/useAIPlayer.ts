
import { useEffect, useState } from 'react';
import { GameState, Piece, BoardPosition } from '@/types/game';
import { findAIMove, AIDifficulty } from '@/utils/aiPlayerUtils';
import { placeSelectedPiece } from '@/utils/boardUtils';

export function useAIPlayer(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  aiPlayerIndex: number,
  difficulty: AIDifficulty = 'medium',
  aiEnabled: boolean = true
) {
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(difficulty);

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
      
      // Find the best move according to the AI's difficulty level
      const aiMove = findAIMove(gameState, aiPlayerIndex, aiDifficulty);
      
      if (!aiMove) {
        // No valid moves, AI needs to pass
        handleAIPass();
      } else {
        // Make the selected move
        makeAIMove(aiMove.piece, aiMove.position);
      }
    } finally {
      setIsAIThinking(false);
    }
  };

  const makeAIMove = (piece: Piece, position: BoardPosition) => {
    // Place the selected piece
    const { updatedGameState } = placeSelectedPiece(
      gameState,
      piece,
      position
    );
    
    // Update the game state
    setGameState(updatedGameState);
  };

  const handleAIPass = () => {
    // Create a pass move in the turn history
    const turnHistoryItem = {
      type: 'pass',
      player: aiPlayerIndex,
      timestamp: Date.now()
    };
    
    // Find the next player with valid moves
    const updatedPlayers = [...gameState.players];
    let nextPlayer = (aiPlayerIndex + 1) % updatedPlayers.length;
    let attempts = 0;
    
    while (attempts < updatedPlayers.length) {
      nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
      attempts++;
    }
    
    // Update the game state
    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      players: updatedPlayers,
      turnHistory: [...prev.turnHistory, turnHistoryItem]
    }));
  };

  // Helper function to determine AI thinking time based on difficulty
  const getThinkingTime = (difficulty: AIDifficulty): number => {
    switch (difficulty) {
      case 'easy':
        return 500 + Math.random() * 500; // 500-1000ms
      case 'medium':
        return 1000 + Math.random() * 1000; // 1000-2000ms
      case 'hard':
        return 1500 + Math.random() * 1500; // 1500-3000ms
    }
  };

  return {
    isAIThinking,
    aiDifficulty,
    setAiDifficulty
  };
}
