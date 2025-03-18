
import React from 'react';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';

interface CornerMarkersProps {
  size: number;
  cellSize: number;
  panPosition: { x: number, y: number };
  playersCount: number;
}

const CornerMarkers: React.FC<CornerMarkersProps> = ({
  size,
  cellSize,
  panPosition,
  playersCount
}) => {
  const isPowerupCell = (row: number, col: number) => {
    if (playersCount === 2) {
      return (
        (row === size - 1 && col === 0) || 
        (row === 0 && col === size - 1)
      );
    }
    return false;
  };

  const markers = [
    { row: 0, col: 0 }, 
    { row: size - 1, col: size - 1 }, 
    { row: 0, col: size - 1 }, 
    { row: size - 1, col: 0 }
  ];

  return (
    <>
      {markers.map((marker, index) => {
        const isAPowerupCell = isPowerupCell(marker.row, marker.col);
        
        if (index > 1 && !isAPowerupCell) {
          return null;
        }

        return (
          <div
            key={`corner-${index}`}
            className={cn(
              'absolute w-3 h-3 rounded-full flex items-center justify-center',
              isAPowerupCell 
                ? 'bg-amber-400 animate-pulse-subtle' 
                : `bg-player${index + 1}`,
              'transition-all duration-300'
            )}
            style={{
              top: marker.row * cellSize + (cellSize / 2) - 6,
              left: marker.col * cellSize + (cellSize / 2) - 6,
              transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
            }}
          >
            {isAPowerupCell && (
              <Wand2 className="w-2 h-2 text-white" />
            )}
          </div>
        );
      })}
    </>
  );
};

export default CornerMarkers;
