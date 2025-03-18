
import { useState } from 'react';
import { AIDifficulty } from '@/utils/ai/aiTypes';
import { toast } from 'sonner';

export function useMultiplayerAI(maxPlayers: number, playerCount: number) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiCount, setAiCount] = useState(1);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  
  const maxPossibleAI = Math.max(0, maxPlayers - 1); // At least 1 human player
  const maxAIPlayers = Math.min(maxPossibleAI, 3); // Cap at 3 AI players
  
  // Calculate remaining slots after human players
  const availableSlots = Math.max(0, maxPlayers - playerCount);
  
  // Ensure AI count doesn't exceed available slots
  const handleSetAiCount = (count: number) => {
    const newCount = Math.min(count, availableSlots);
    if (newCount !== count && count > availableSlots) {
      toast.info(`Limited to ${availableSlots} AI player${availableSlots !== 1 ? 's' : ''} based on available slots`);
    }
    setAiCount(newCount);
  };
  
  // When toggling AI, adjust count if needed
  const handleToggleAI = (enabled: boolean) => {
    setAiEnabled(enabled);
    if (enabled && aiCount > availableSlots) {
      handleSetAiCount(availableSlots);
    }
  };
  
  return {
    aiEnabled,
    aiCount,
    aiDifficulty,
    maxAIPlayers: Math.min(maxAIPlayers, availableSlots),
    availableSlots,
    setAiEnabled: handleToggleAI,
    setAiCount: handleSetAiCount,
    setAiDifficulty
  };
}
