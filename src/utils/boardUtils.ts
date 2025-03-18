
import { GameState, Piece, BoardPosition, TurnHistoryItem } from '@/types/game';
import { hasValidMoves } from '@/utils/gameUtils';
import { collectPowerup } from '@/utils/powerupUtils';

// Place a piece on the board and update game state
export function placeSelectedPiece(
  gameState: GameState,
  selectedPiece: Piece,
  position: BoardPosition
): { updatedGameState: GameState; powerupCollected: boolean } {
  const newBoard = [...gameState.board.map(row => [...row])];
  let updatedGameState = { ...gameState, board: newBoard };
  let powerupCollected = false;
  
  // Place the piece on the board
  for (let i = 0; i < selectedPiece.shape.length; i++) {
    for (let j = 0; j < selectedPiece.shape[i].length; j++) {
      if (selectedPiece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        // Check if we're placing on a powerup cell
        if (newBoard[boardRow][boardCol].hasPowerup) {
          powerupCollected = true;
        }
        
        newBoard[boardRow][boardCol] = {
          player: gameState.currentPlayer,
          pieceId: selectedPiece.id
        };
      }
    }
  }
  
  // Check if a powerup was collected and update game state
  if (powerupCollected) {
    updatedGameState = collectPowerup(updatedGameState, position);
  }
  
  const updatedPlayers = [...updatedGameState.players];
  const currentPlayerIndex = updatedGameState.currentPlayer;
  
  // Mark the piece as used
  updatedPlayers[currentPlayerIndex].pieces = updatedPlayers[currentPlayerIndex].pieces.map(
    piece => piece.id === selectedPiece.id ? { ...piece, used: true, hidden: true } : piece
  );
  
  // Record the move in player's history
  updatedPlayers[currentPlayerIndex].moveHistory.push({
    type: 'place',
    piece: selectedPiece.id,
    position,
    timestamp: Date.now()
  });
  
  // Add to turn history
  const turnHistoryItem: TurnHistoryItem = {
    type: 'place',
    player: currentPlayerIndex,
    piece: selectedPiece.id,
    position,
    timestamp: Date.now()
  };
  
  // Find next player with valid moves
  let nextPlayer = (currentPlayerIndex + 1) % updatedPlayers.length;
  let attempts = 0;
  
  while (!hasValidMoves(updatedGameState, nextPlayer) && nextPlayer !== currentPlayerIndex) {
    nextPlayer = (nextPlayer + 1) % updatedPlayers.length;
    attempts++;
    
    if (attempts >= updatedPlayers.length) {
      break;
    }
  }
  
  // Return final updated state
  return {
    updatedGameState: {
      ...updatedGameState,
      board: updatedGameState.board,
      players: updatedPlayers,
      currentPlayer: nextPlayer,
      turnHistory: [...updatedGameState.turnHistory, turnHistoryItem],
      gameStats: {
        ...updatedGameState.gameStats,
        totalMoves: updatedGameState.gameStats.totalMoves + 1,
        lastMoveTime: Date.now()
      }
    },
    powerupCollected
  };
}
