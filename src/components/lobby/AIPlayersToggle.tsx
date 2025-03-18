
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Brain, Plus, Minus } from 'lucide-react';
import { AIDifficulty } from '@/utils/ai/aiTypes';
import { cn } from '@/lib/utils';

interface AIPlayersToggleProps {
  aiEnabled: boolean;
  aiCount: number;
  aiDifficulty: AIDifficulty;
  maxAIPlayers: number;
  onToggleAI: (enabled: boolean) => void;
  onChangeAICount: (count: number) => void;
  onChangeDifficulty: (difficulty: AIDifficulty) => void;
}

const AIPlayersToggle: React.FC<AIPlayersToggleProps> = ({
  aiEnabled,
  aiCount,
  aiDifficulty,
  maxAIPlayers,
  onToggleAI,
  onChangeAICount,
  onChangeDifficulty
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <Label htmlFor="ai-toggle" className="font-medium">AI Players</Label>
        </div>
        <Switch
          id="ai-toggle"
          checked={aiEnabled}
          onCheckedChange={onToggleAI}
        />
      </div>
      
      {aiEnabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Players: {aiCount}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChangeAICount(Math.max(1, aiCount - 1))}
                disabled={aiCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChangeAICount(Math.min(maxAIPlayers, aiCount + 1))}
                disabled={aiCount >= maxAIPlayers}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Difficulty</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => (
                <Button
                  key={level}
                  variant={aiDifficulty === level ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-full capitalize",
                    aiDifficulty === level ? "bg-primary" : "bg-background"
                  )}
                  onClick={() => onChangeDifficulty(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlayersToggle;
