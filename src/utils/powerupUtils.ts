
import { GameState, BoardPosition, PowerupItem, TurnHistoryItem } from '@/types/game';
import { powerupCorners } from './gameConstants';

// Handle using the destroy powerup
export function useDestroyPowerup(gameState: GameState, position: BoardPosition): GameState {
  const { row, col } = position;
  const cellToDestroy = gameState.board[row][col];
  
  // Check if cell has a player's piece
  if (cellToDestroy.player === null) {
    return gameState; // Can't destroy empty cell
  }
  
  // Clone the game state and board
  const newBoard = gameState.board.map(r => [...r]);
  
  // Clear the cell
  newBoard[row][col] = { player: null };
  
  // Remove powerup from current player's inventory
  const updatedPlayers = [...gameState.players];
  const currentPlayerIndex = gameState.currentPlayer;
  const currentPlayer = updatedPlayers[currentPlayerIndex];
  
  if (currentPlayer.powerups) {
    const destroyPowerupIndex = currentPlayer.powerups.findIndex(p => p.type === 'destroy');
    if (destroyPowerupIndex >= 0) {
      // Reduce count or remove if last one
      if (currentPlayer.powerups[destroyPowerupIndex].count > 1) {
        currentPlayer.powerups[destroyPowerupIndex].count -= 1;
      } else {
        currentPlayer.powerups.splice(destroyPowerupIndex, 1);
      }
    }
  }
  
  // Add a record to the turn history
  const turnHistoryItem: TurnHistoryItem = {
    type: 'use-powerup',
    player: currentPlayerIndex,
    powerupType: 'destroy',
    targetPosition: position,
    timestamp: Date.now()
  };
  
  return {
    ...gameState,
    board: newBoard,
    players: updatedPlayers,
    turnHistory: [...gameState.turnHistory, turnHistoryItem]
  };
}

// Main powerup handler
export function handlePowerups(
  gameState: GameState, 
  position: BoardPosition
): { updatedGameState: GameState; success: boolean; message?: string } {
  // Currently only handling destroy powerup
  const updatedGameState = useDestroyPowerup(gameState, position);
  
  // If game state didn't change, powerup failed
  if (updatedGameState === gameState) {
    return { 
      updatedGameState: gameState, 
      success: false, 
      message: "Cannot destroy an empty cell" 
    };
  }
  
  return { 
    updatedGameState, 
    success: true, 
    message: "Block destroyed successfully!" 
  };
}

// Add powerup to player inventory from board
export function collectPowerup(gameState: GameState, position: BoardPosition): GameState {
  const updatedPlayers = [...gameState.players];
  const currentPlayerIndex = gameState.currentPlayer;
  const currentPlayer = updatedPlayers[currentPlayerIndex];
  
  // Get powerup type from the cell (default to 'destroy' if not specified)
  const powerupType = gameState.board[position.row][position.col].powerupType || 'destroy';
  
  // Initialize powerups array if it doesn't exist
  if (!currentPlayer.powerups) {
    currentPlayer.powerups = [];
  }
  
  // Check if player already has this type of powerup
  const existingPowerupIndex = currentPlayer.powerups.findIndex(p => p.type === powerupType);
  
  if (existingPowerupIndex >= 0) {
    // Increment count
    currentPlayer.powerups[existingPowerupIndex].count += 1;
  } else {
    // Add new powerup
    currentPlayer.powerups.push({ type: powerupType, count: 1 });
  }
  
  return {
    ...gameState,
    players: updatedPlayers
  };
}
