
import { useState } from 'react';
import { AIDifficulty } from '@/utils/aiPlayerUtils';

// Helper function to determine AI thinking time based on difficulty
export const getThinkingTime = (difficulty: AIDifficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 500 + Math.random() * 500; // 500-1000ms
    case 'medium':
      return 1000 + Math.random() * 1000; // 1000-2000ms
    case 'hard':
      return 1500 + Math.random() * 1500; // 1500-3000ms
  }
};

export function useAIThinking(difficulty: AIDifficulty = 'medium') {
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(difficulty);

  return {
    isAIThinking,
    setIsAIThinking,
    aiDifficulty,
    setAiDifficulty,
    getThinkingTime
  };
}
