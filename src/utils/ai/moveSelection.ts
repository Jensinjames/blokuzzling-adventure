
import { AIDifficulty, AIMove } from './aiTypes';

// Choose a move from the list of possible moves
export const chooseMove = (
  possibleMoves: AIMove[],
  difficulty: AIDifficulty
): { piece: any; position: { row: number; col: number } } => {
  // Sort moves by score (highest first)
  const sortedMoves = [...possibleMoves].sort((a, b) => b.score - a.score);
  
  switch (difficulty) {
    case 'easy':
      // Easy AI randomly picks from the top 60% of moves
      const easyIndex = Math.floor(Math.random() * Math.ceil(sortedMoves.length * 0.6));
      return {
        piece: sortedMoves[easyIndex].piece,
        position: sortedMoves[easyIndex].position
      };
      
    case 'medium':
      // Medium AI randomly picks from the top 30% of moves
      const mediumIndex = Math.floor(Math.random() * Math.ceil(sortedMoves.length * 0.3));
      return {
        piece: sortedMoves[mediumIndex].piece,
        position: sortedMoves[mediumIndex].position
      };
      
    case 'hard':
      // Hard AI usually picks the best move, but occasionally (20% chance) picks the 2nd best move
      const randomFactor = Math.random();
      const index = randomFactor > 0.8 && sortedMoves.length > 1 ? 1 : 0;
      return {
        piece: sortedMoves[index].piece,
        position: sortedMoves[index].position
      };
  }
};
