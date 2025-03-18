
import { AIDifficulty } from './aiTypes';

// Helper function to get rotation options based on difficulty
export const getRotationOptions = (difficulty: AIDifficulty): number[] => {
  switch (difficulty) {
    case 'easy':
      // Easy AI tries only two rotations to simulate less thorough analysis
      return [0, 1];
    case 'medium':
      // Medium AI tries all four rotations
      return [0, 1, 2, 3];
    case 'hard':
      // Hard AI tries all four rotations
      return [0, 1, 2, 3];
  }
};

// Helper function to get flip options based on difficulty
export const getFlipOptions = (difficulty: AIDifficulty): boolean[] => {
  switch (difficulty) {
    case 'easy':
      // Easy AI rarely tries flipping (30% chance)
      return Math.random() < 0.3 ? [false, true] : [false];
    case 'medium':
      // Medium AI tries with and without flipping
      return [false, true];
    case 'hard':
      // Hard AI always tries with and without flipping
      return [false, true];
  }
};
