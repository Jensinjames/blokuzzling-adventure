import React, { useEffect, useState } from 'react';
import { BoardPosition, GameState, Piece } from '@/types/game';
import { useIsMobile } from '@/hooks/use-mobile';
import BoardCell from '@/components/board/BoardCell';
import PiecePreview from '@/components/board/PiecePreview';
import CornerMarkers from '@/components/board/CornerMarkers';
import BoardControls from '@/components/board/BoardControls';

interface GameBoardProps {
  gameState: GameState;
  size: number;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
  selectedPiecePreview: Piece | null;
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

  return (
    <div className="game-board-container relative w-full flex flex-col items-center my-4">
      {isMobile && (
        <BoardControls 
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
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
              <BoardCell
                key={`cell-${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                player={cell.player}
                hasPowerup={cell.hasPowerup || false}
                isPowerupActive={isPowerupActive}
                cellSize={cellSize}
                onClick={onCellClick}
                onMouseEnter={onCellHover}
                isMobile={isMobile}
              />
            ))
          )}
          
          {selectedPiecePreview && previewPosition && (
            <PiecePreview
              piece={selectedPiecePreview}
              position={previewPosition}
              isValidPlacement={isValidPlacement}
              panPosition={panPosition}
              cellSize={cellSize}
              currentPlayer={gameState.currentPlayer}
            />
          )}
          
          <CornerMarkers
            size={size}
            cellSize={cellSize}
            panPosition={panPosition}
            playersCount={gameState.players.length}
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
