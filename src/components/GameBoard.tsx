
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BoardCell, GameState, BoardPosition } from '@/types/game';
import { Wand2 } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  size: number;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
  selectedPiecePreview: { shape: number[][] } | null;
  previewPosition: BoardPosition | null;
  isValidPlacement: boolean;
  isPowerupActive?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  size,
  onCellClick,
  onCellHover,
  selectedPiecePreview,
  previewPosition,
  isValidPlacement,
  isPowerupActive = false
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
    // Only show player 1 and player 2 corners in 2-player game
    // Add powerup markers to corners 2, 3 and 4 in single player mode
    const isPowerupCell = (row: number, col: number) => {
      if (gameState.players.length === 2) {
        // In 2-player game, corners 2 and 3 are powerup cells
        return (
          (row === size - 1 && col === 0) || // Corner 3 (bottom-left)
          (row === 0 && col === size - 1)     // Corner 2 (top-right)
        );
      }
      return false;
    };

    const markers = [
      { row: 0, col: 0 },                  // Player 1: top-left
      { row: size - 1, col: size - 1 },    // Player 2: bottom-right
      { row: 0, col: size - 1 },           // Corner 2 (top-right): powerup in single player
      { row: size - 1, col: 0 }            // Corner 3 (bottom-left): powerup in single player
    ];

    return markers.map((marker, index) => {
      // Check if this is a powerup corner in single player mode
      const isAPowerupCell = isPowerupCell(marker.row, marker.col);
      
      // Only show player 1 and 2 corners in regular case, or powerup cells
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
          }}
        >
          {isAPowerupCell && (
            <Wand2 className="w-2 h-2 text-white" />
          )}
        </div>
      );
    }).filter(Boolean);
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
        {gameState.board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                "board-cell cursor-pointer",
                cell.player !== null 
                  ? getPlayerColor(cell.player) 
                  : isPowerupActive 
                    ? "hover:bg-red-200" 
                    : "hover:bg-gray-100",
                cell.hasPowerup && "ring-2 ring-amber-400"
              )}
              style={{ width: cellSize, height: cellSize }}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              onMouseEnter={() => onCellHover({ row: rowIndex, col: colIndex })}
            >
              {cell.hasPowerup && (
                <div className="flex items-center justify-center h-full">
                  <Wand2 className="w-4 h-4 text-white animate-pulse" />
                </div>
              )}
            </div>
          ))
        )}
        {renderPiecePreview()}
        {renderCornerMarkers()}
      </div>
    </div>
  );
};

export default GameBoard;
