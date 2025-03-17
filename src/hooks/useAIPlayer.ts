
import { useEffect, useState } from 'react';
import { GameState, Piece, BoardPosition } from '@/types/game';
import { AIDifficulty, findAIMove } from '@/utils/aiPlayerUtils';
import { placeSelectedPiece } from '@/utils/boardUtils';
import { hasValidMoves } from '@/utils/gameLogic';
import { toast } from 'sonner';

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

// Helper function to handle game completion when both players are out of moves
const handleGameCompletion = (
  gameState: GameState,
  aiPlayerIndex: number,
  humanPlayerIndex: number,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  turnHistoryItem: any
) => {
  // Calculate remaining piece values for each player
  const updatedPlayers = [...gameState.players].map(player => {
    const unusedPiecesCount = player.pieces.filter(p => !p.used).length;
    return {
      ...player,
      score: 55 - unusedPiecesCount // Total pieces (55) minus remaining pieces
    };
  });
  
  // Determine winner based on highest score (least remaining pieces)
  const winner = updatedPlayers[0].score > updatedPlayers[1].score ? 0 : 
                updatedPlayers[0].score < updatedPlayers[1].score ? 1 : null;
  
  // Update game state to finished
  setGameState(prev => ({
    ...prev,
    players: updatedPlayers,
    gameStatus: 'finished',
    winner,
    turnHistory: [...prev.turnHistory, turnHistoryItem]
  }));
  
  // Notify player of game result
  if (winner === humanPlayerIndex) {
    toast.success("Congratulations! You've won the game!");
  } else if (winner === aiPlayerIndex) {
    toast.error("You've lost the game. Better luck next time!");
  } else {
    toast.info("The game ended in a tie!");
  }
};

// Helper function to make an AI move
const makeAIMove = (
  gameState: GameState,
  piece: Piece,
  position: BoardPosition,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  // Place the selected piece
  const { updatedGameState } = placeSelectedPiece(
    gameState,
    piece,
    position
  );
  
  // Update the game state
  setGameState(updatedGameState);
};

export function useAIPlayer(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  aiPlayerIndex: number,
  difficulty: AIDifficulty = 'medium',
  aiEnabled: boolean = true
) {
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(difficulty);
  const humanPlayerIndex = 0; // Assuming human is always player 0

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
        handleAIPass();
        return;
      }
      
      // Find the best move according to the AI's difficulty level
      const aiMove = findAIMove(gameState, aiPlayerIndex, aiDifficulty);
      
      if (!aiMove) {
        // No valid moves were found (fallback for safety)
        handleAIPass();
      } else {
        // Make the selected move
        makeAIMove(gameState, aiMove.piece, aiMove.position, setGameState);
      }
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleAIPass = () => {
    // Create a pass move in the turn history
    const turnHistoryItem = {
      type: 'pass',
      player: aiPlayerIndex,
      timestamp: Date.now()
    };
    
    // Check if human player has valid moves
    const humanHasValidMoves = hasValidMoves(gameState, humanPlayerIndex);
    
    // If neither player has valid moves, the game should end
    if (!humanHasValidMoves) {
      // Both players are out of moves, calculate final scores and determine winner
      handleGameCompletion(gameState, aiPlayerIndex, humanPlayerIndex, setGameState, turnHistoryItem);
    } else {
      // Human player has moves, continue the game
      setGameState(prev => ({
        ...prev,
        currentPlayer: humanPlayerIndex,
        turnHistory: [...prev.turnHistory, turnHistoryItem]
      }));
    }
  };

  return {
    isAIThinking,
    aiDifficulty,
    setAiDifficulty
  };
}
