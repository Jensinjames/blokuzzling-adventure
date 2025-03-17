
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, RotateCcw, SkipForward, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onPass: () => void;
  onHome: () => void;
  canUndo: boolean;
  isGameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onReset,
  onPass,
  onHome,
  canUndo,
  isGameOver
}) => {
  return (
    <div className="glass-panel w-full flex justify-between items-center">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            "control-button",
            !canUndo && "opacity-50"
          )}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="control-button"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex space-x-2">
        {!isGameOver && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPass}
            className="control-button"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Pass
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onHome}
          className="control-button"
        >
          <Home className="h-4 w-4 mr-1" />
          Menu
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
