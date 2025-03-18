
import React from 'react';
import { cn } from '@/lib/utils';
import { BoardPosition, Piece } from '@/types/game';

interface PiecePreviewProps {
  piece: Piece;
  position: BoardPosition;
  isValidPlacement: boolean;
  panPosition: { x: number; y: number };
  cellSize: number;
  currentPlayer: number;
}

const PiecePreview: React.FC<PiecePreviewProps> = ({
  piece,
  position,
  isValidPlacement,
  panPosition,
  cellSize,
  currentPlayer
}) => {
  const getPlayerColor = (player: number | null): string => {
    if (player === null) return 'bg-transparent';
    const colors = ['bg-player1', 'bg-player2', 'bg-player3', 'bg-player4'];
    return colors[player % colors.length];
  };

  return (
    <div 
      className={cn(
        'absolute pointer-events-none transition-all duration-200',
        isValidPlacement ? 'opacity-60' : 'opacity-30'
      )}
      style={{
        top: position.row * cellSize,
        left: position.col * cellSize,
        transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
      }}
    >
      {piece.shape.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div 
              key={colIndex} 
              className={cn(
                'piece-cell border border-gray-300',
                cell ? getPlayerColor(currentPlayer) : 'bg-transparent'
              )}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PiecePreview;
