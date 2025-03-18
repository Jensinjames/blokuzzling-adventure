
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BoardCell, GameState, BoardPosition } from '@/types/game';
import { Wand2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

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
  const isMobile = useIsMobile();
  const [boardSize, setBoardSize] = useState(Math.min(window.innerWidth - 40, 500));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panning, setPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const cellSize = (boardSize / size) * zoomLevel;
  
  const getPlayerColor = (player: number | null): string => {
    if (player === null) return 'bg-transparent';
    const colors = ['bg-player1', 'bg-player2', 'bg-player3', 'bg-player4'];
    return colors[player % colors.length];
  };

  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        setBoardSize(Math.min(window.innerWidth - 24, 500));
      } else {
        setBoardSize(Math.min(window.innerWidth - 40, 500));
      }
    };

    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
    setPanPosition({ x: 0, y: 0 }); // Reset pan when zooming
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
    setPanPosition({ x: 0, y: 0 }); // Reset pan when zooming
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      setPanning(true);
      setStartPan({ 
        x: e.touches[0].clientX - panPosition.x, 
        y: e.touches[0].clientY - panPosition.y 
      });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (panning && zoomLevel > 1) {
      const maxPan = (boardSize * zoomLevel - boardSize) / 2;
      const newX = e.touches[0].clientX - startPan.x;
      const newY = e.touches[0].clientY - startPan.y;
      
      setPanPosition({
        x: Math.max(Math.min(newX, maxPan), -maxPan),
        y: Math.max(Math.min(newY, maxPan), -maxPan)
      });
      
      e.preventDefault(); // Prevent scrolling while panning
    }
  };
  
  const handleTouchEnd = () => {
    setPanning(false);
  };

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
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
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
    const isPowerupCell = (row: number, col: number) => {
      if (gameState.players.length === 2) {
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

    return markers.map((marker, index) => {
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
    }).filter(Boolean);
  };

  return (
    <div className="game-board-container relative w-full flex flex-col items-center my-4">
      {isMobile && (
        <div className="flex space-x-2 mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            disabled={zoomLevel <= 0.75}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div 
        className="game-board-scroll-container overflow-hidden touch-pan-y"
        style={{ 
          width: boardSize, 
          height: boardSize,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="game-board relative"
          style={{ 
            width: boardSize * zoomLevel, 
            height: boardSize * zoomLevel,
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
            transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
            transition: panning ? 'none' : 'transform 0.3s ease-out',
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
                  cell.hasPowerup && "ring-2 ring-amber-400",
                  isMobile ? "touch-manipulation" : ""
                )}
                style={{ 
                  width: cellSize, 
                  height: cellSize,
                  minWidth: isMobile ? '20px' : 'auto',
                  minHeight: isMobile ? '20px' : 'auto'
                }}
                onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                onMouseEnter={() => onCellHover({ row: rowIndex, col: colIndex })}
              >
                {cell.hasPowerup && (
                  <div className="flex items-center justify-center h-full">
                    <Wand2 className={cn(
                      "text-white animate-pulse",
                      isMobile ? "w-2 h-2" : "w-4 h-4"
                    )} />
                  </div>
                )}
              </div>
            ))
          )}
          {renderPiecePreview()}
          {renderCornerMarkers()}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
