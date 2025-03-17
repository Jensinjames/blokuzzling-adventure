
import { GameState, BoardPosition } from '@/types/game';
import { calculateScore } from './pieceManipulation';
import { hasValidMoves } from './gameLogic';

export const checkGameOver = (gameState: GameState): boolean => {
  for (let playerIndex = 0; playerIndex < gameState.players.length; playerIndex++) {
    if (hasValidMoves(gameState, playerIndex)) {
      return false;
    }
  }
  return true;
};

export const determineWinner = (players: GameState['players']): number | null => {
  if (players.length === 0) return null;
  
  let maxScore = players[0].score;
  let maxPlayerIndex = 0;
  let hasTie = false;
  
  for (let i = 1; i < players.length; i++) {
    if (players[i].score > maxScore) {
      maxScore = players[i].score;
      maxPlayerIndex = i;
      hasTie = false;
    } else if (players[i].score === maxScore) {
      hasTie = true;
    }
  }
  
  return hasTie ? null : maxPlayerIndex;
};

export const isPowerupCorner = (position: BoardPosition, numPlayers: number): boolean => {
  if (numPlayers !== 2) return false;
  
  const { powerupCorners } = require('./gameConstants');
  
  return powerupCorners.some((corner: BoardPosition) => 
    corner.row === position.row && corner.col === position.col
  );
};
