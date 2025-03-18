
import React from 'react';
import { cn } from '@/lib/utils';
import { BoardPosition } from '@/types/game';
import { Wand2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BoardCellProps {
  row: number;
  col: number;
  player: number | null;
  hasPowerup: boolean;
  isPowerupActive: boolean;
  cellSize: number;
  onClick: (position: BoardPosition) => void;
  onMouseEnter: (position: BoardPosition) => void;
  isMobile: boolean;
}

const BoardCell: React.FC<BoardCellProps> = ({
  row,
  col,
  player,
  hasPowerup,
  isPowerupActive,
  cellSize,
  onClick,
  onMouseEnter,
  isMobile
}) => {
  const getPlayerColor = (player: number | null): string => {
    if (player === null) return 'bg-transparent';
    const colors = ['bg-player1', 'bg-player2', 'bg-player3', 'bg-player4'];
    return colors[player % colors.length];
  };

  return (
    <div
      className={cn(
        "board-cell cursor-pointer",
        player !== null 
          ? getPlayerColor(player) 
          : isPowerupActive 
            ? "hover:bg-red-200" 
            : "hover:bg-gray-100",
        hasPowerup && "ring-2 ring-amber-400",
        isMobile ? "touch-manipulation" : ""
      )}
      style={{ 
        width: cellSize, 
        height: cellSize,
        minWidth: isMobile ? '20px' : 'auto',
        minHeight: isMobile ? '20px' : 'auto'
      }}
      onClick={() => onClick({ row, col })}
      onMouseEnter={() => onMouseEnter({ row, col })}
    >
      {hasPowerup && (
        <div className="flex items-center justify-center h-full">
          <Wand2 className={cn(
            "text-white animate-pulse",
            isMobile ? "w-2 h-2" : "w-4 h-4"
          )} />
        </div>
      )}
    </div>
  );
};

export default BoardCell;
