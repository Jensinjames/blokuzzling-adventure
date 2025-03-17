
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BoardCell, GameState, BoardPosition } from '@/types/game';

interface GameBoardProps {
  gameState: GameState;
  size: number;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
  selectedPiecePreview: { shape: number[][] } | null;
  previewPosition: BoardPosition | null;
  isValidPlacement: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  size,
  onCellClick,
  onCellHover,
  selectedPiecePreview,
  previewPosition,
  isValidPlacement
}) => {
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 500));
  const cellSize = boardSize / size;
  
  const getPlayerColor = (player: number | null): string => {
    if (player === null) return 'bg-transparent';
    const colors = ['bg-player1', 'bg-player2', 'bg-player3', 'bg-player4'];
    return colors[player % colors.length];
  };

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(Math.min(window.innerWidth - 40, 500));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderPiecePreview = () => {
    if (!selectedPiecePreview || !previewPosition) return null;
    
    return (
      <div 
        className={cn(
          'absolute pointer-events-none transition-all duration-200',
          isValidPlacement ? 'opacity-60' : 'opacity-30'
        )}
        style={{
          top: previewPosition.row * cellSize,
          left: previewPosition.col * cellSize,
        }}
      >
        {selectedPiecePreview.shape.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div 
                key={colIndex} 
                className={cn(
                  'piece-cell border border-gray-300',
                  cell ? getPlayerColor(gameState.currentPlayer) : 'bg-transparent'
                )}
                style={{ width: cellSize, height: cellSize }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderCornerMarkers = () => {
    const markers = [
      { row: 0, col: 0 },
      { row: 0, col: size - 1 },
      { row: size - 1, col: size - 1 },
      { row: size - 1, col: 0 }
    ];

    return markers.map((marker, index) => (
      <div
        key={`corner-${index}`}
        className={cn(
          'absolute w-3 h-3 rounded-full',
          `bg-player${index + 1}`,
          'transition-all duration-300 animate-pulse-subtle'
        )}
        style={{
          top: marker.row * cellSize + (cellSize / 2) - 6,
          left: marker.col * cellSize + (cellSize / 2) - 6,
        }}
      />
    ));
  };

  return (
    <div className="game-board-container relative w-full flex justify-center my-4">
      <div 
        className="game-board relative"
        style={{ 
          width: boardSize, 
          height: boardSize,
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
      >
        {gameState.board.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "board-cell cursor-pointer",
                  cell.player !== null ? getPlayerColor(cell.player) : "hover:bg-gray-100"
                )}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                onMouseEnter={() => onCellHover({ row: rowIndex, col: colIndex })}
              />
            ))}
          </React.Fragment>
        ))}
        {renderPiecePreview()}
        {renderCornerMarkers()}
      </div>
    </div>
  );
};

export default GameBoard;
