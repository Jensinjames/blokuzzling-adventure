
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AIMove = {
  piece: any;
  position: {
    row: number;
    col: number;
  };
  score: number;
};
