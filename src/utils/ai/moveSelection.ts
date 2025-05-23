
import { AIDifficulty, AIMove } from './aiTypes';

// Choose a move from the list of possible moves
export const chooseMove = (
  possibleMoves: AIMove[],
  difficulty: AIDifficulty
): AIMove => {
  // Sort moves by score (highest first)
  const sortedMoves = [...possibleMoves].sort((a, b) => b.score - a.score);
  
  switch (difficulty) {
    case 'easy':
      // Easy AI picks randomly from the top 60% of moves
      // But prioritizes big pieces over optimal placement
      const easyPool = Math.ceil(sortedMoves.length * 0.6);
      const easyIndex = Math.floor(Math.random() * easyPool);
      return sortedMoves[easyIndex];
      
    case 'medium':
      // Medium AI usually picks from the top 30% of moves
      // But has a 30% chance of making a suboptimal move
      if (Math.random() < 0.3) {
        // Occasionally pick from the middle of the pack
        const middleIndex = Math.floor(sortedMoves.length * 0.3) + 
                           Math.floor(Math.random() * Math.floor(sortedMoves.length * 0.4));
        return sortedMoves[Math.min(middleIndex, sortedMoves.length - 1)];
      } else {
        // Usually pick from the top moves
        const topMediumMoves = Math.ceil(sortedMoves.length * 0.3);
        const mediumIndex = Math.floor(Math.random() * Math.min(3, topMediumMoves));
        return sortedMoves[mediumIndex];
      }
      
    case 'hard':
      // Hard AI picks the best move 80% of the time
      // But occasionally (20% chance) picks the 2nd or 3rd best move
      // to create some variability and not be too predictable
      if (sortedMoves.length <= 1) {
        return sortedMoves[0];
      }
      
      const randomFactor = Math.random();
      let index = 0;
      
      if (randomFactor > 0.8 && sortedMoves.length > 2) {
        // Pick 2nd or 3rd best move occasionally
        index = 1 + Math.floor(Math.random() * Math.min(2, sortedMoves.length - 1));
      }
      
      return sortedMoves[index];
  }
};
