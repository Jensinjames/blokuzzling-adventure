
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

// Helper function to calculate player scores based on remaining pieces
const calculateFinalScores = (players: GameState['players']): GameState['players'] => {
  return players.map(player => {
    const unusedPieces = player.pieces.filter(p => !p.used);
    // Score is 89 (total of all piece cells) minus remaining pieces' cells
    let remainingCellCount = 0;
    for (const piece of unusedPieces) {
      remainingCellCount += piece.shape.flat().filter(cell => cell === 1).length;
    }
    return {
      ...player,
      score: 89 - remainingCellCount // 89 is the total number of cells in all pieces
    };
  });
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
  const [lastPassPlayer, setLastPassPlayer] = useState<number | null>(null);

  // Check for consecutive passes to end the game
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;
    
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
      const updatedPlayers = calculateFinalScores(gameState.players);
      
      // Determine winner based on highest score
      const winner = updatedPlayers[0].score > updatedPlayers[1].score ? 0 : 
                    updatedPlayers[0].score < updatedPlayers[1].score ? 1 : null;
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        gameStatus: 'finished',
        winner,
        turnHistory: [...prev.turnHistory, turnHistoryItem]
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
