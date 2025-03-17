
import { GameState } from '@/types/game';
import { BOARD_SIZE } from '@/utils/gameUtils';

// Handle undoing the last move
export function handleUndoAction(gameState: GameState): { updatedGameState: GameState } {
  const lastMove = gameState.turnHistory[gameState.turnHistory.length - 1];
  const newTurnHistory = gameState.turnHistory.slice(0, -1);
  
  if (lastMove.type === 'place' && lastMove.piece) {
    const newBoard = gameState.board.map(row => [...row]);
    
    // Remove the last placed piece from the board
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (newBoard[row][col].player === lastMove.player && 
            newBoard[row][col].pieceId === lastMove.piece) {
          // Restore powerup cells if applicable
          const isPowerupCell = gameState.powerupCells?.some(
            pos => pos.row === row && pos.col === col
          );
          
          newBoard[row][col] = isPowerupCell 
            ? { player: null, hasPowerup: true, powerupType: 'destroy' } 
            : { player: null };
        }
      }
    }
    
    const updatedPlayers = [...gameState.players];
    
    // Mark the piece as unused
    updatedPlayers[lastMove.player].pieces = updatedPlayers[lastMove.player].pieces.map(
      piece => piece.id === lastMove.piece ? { ...piece, used: false } : piece
    );
    
    // Remove the move from player's history
    updatedPlayers[lastMove.player].moveHistory = updatedPlayers[lastMove.player].moveHistory.filter(
      move => move.type !== 'place' || (move.timestamp !== lastMove.timestamp)
    );
    
    return {
      updatedGameState: {
        ...gameState,
        board: newBoard,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory,
        gameStatus: 'playing',
        winner: null
      }
    };
  } else if (lastMove.type === 'pass') {
    const updatedPlayers = [...gameState.players];
    
    // Remove the pass action from player's history
    updatedPlayers[lastMove.player].moveHistory = updatedPlayers[lastMove.player].moveHistory.filter(
      move => move.type !== 'pass' || (move.timestamp !== lastMove.timestamp)
    );
    
    return {
      updatedGameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory
      }
    };
  } else if (lastMove.type === 'use-powerup' && lastMove.targetPosition) {
    // Handle undoing powerup usage
    const updatedPlayers = [...gameState.players];
    const currentPlayer = updatedPlayers[lastMove.player];
    
    // Return the powerup to the player's inventory
    const powerupType = lastMove.powerupType || 'destroy';
    const existingPowerupIndex = currentPlayer.powerups?.findIndex(p => p.type === powerupType) || -1;
    
    if (existingPowerupIndex >= 0 && currentPlayer.powerups) {
      currentPlayer.powerups[existingPowerupIndex].count += 1;
    } else {
      if (!currentPlayer.powerups) {
        currentPlayer.powerups = [];
      }
      currentPlayer.powerups.push({ type: powerupType, count: 1 });
    }
    
    return {
      updatedGameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayer: lastMove.player,
        turnHistory: newTurnHistory
      }
    };
  }
  
  // Default case - just return the game state with the last move removed
  return {
    updatedGameState: {
      ...gameState,
      turnHistory: newTurnHistory
    }
  };
}
