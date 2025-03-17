
import React from 'react';
import { Brain } from 'lucide-react';
import { AIDifficulty } from '@/utils/aiPlayerUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIDifficultySelectorProps {
  difficulty: AIDifficulty;
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  className?: string;
}

const AIDifficultySelector: React.FC<AIDifficultySelectorProps> = ({ 
  difficulty, 
  onSelectDifficulty,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-medium">AI Player Difficulty</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => (
          <Button
            key={level}
            variant={difficulty === level ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full capitalize",
              difficulty === level ? "bg-primary" : "bg-background"
            )}
            onClick={() => onSelectDifficulty(level)}
          >
            {level}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {difficulty === 'easy' && (
          "AI will make simple moves and won't optimize piece placement."
        )}
        {difficulty === 'medium' && (
          "AI will consider better piece positions and some strategic moves."
        )}
        {difficulty === 'hard' && (
          "AI will strategically place pieces to maximize score and block your plays."
        )}
      </div>
    </div>
  );
};

export default AIDifficultySelector;
