
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Piece } from '@/types/game';
import { Button } from '@/components/ui/button';
import { RotateCw, FlipHorizontal } from 'lucide-react';

interface PieceSelectorProps {
  pieces: Piece[];
  currentPlayer: number;
  onSelectPiece: (piece: Piece) => void;
  onRotatePiece: () => void;
  onFlipPiece: () => void;
  selectedPiece: Piece | null;
}

const PieceSelector: React.FC<PieceSelectorProps> = ({
  pieces,
  currentPlayer,
  onSelectPiece,
  onRotatePiece,
  onFlipPiece,
  selectedPiece
}) => {
  // Filter out pieces that are marked as hidden (already played)
  const availablePieces = pieces.filter(p => !p.hidden && !p.used);
  const [displayedPieces, setDisplayedPieces] = useState<Piece[]>(availablePieces.slice(0, 5));
  const [page, setPage] = useState(0);
  
  // Update displayed pieces whenever available pieces change
  useEffect(() => {
    setDisplayedPieces(availablePieces.slice(page * 5, (page + 1) * 5));
  }, [availablePieces, page]);
  
  const totalPages = Math.ceil(availablePieces.length / 5);
  
  const getPlayerColor = (player: number): string => {
    const colors = ['bg-player1', 'bg-player2', 'bg-player3', 'bg-player4'];
    return colors[player % colors.length];
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      setDisplayedPieces(availablePieces.slice(newPage * 5, (newPage + 1) * 5));
    }
  };

  const renderPieceShape = (piece: Piece, size: number = 24) => {
    return (
      <div className="piece-grid transition-all duration-200" style={{
        display: 'grid',
        gridTemplateRows: `repeat(${piece.shape.length}, ${size}px)`,
        gridTemplateColumns: `repeat(${piece.shape[0].length}, ${size}px)`,
      }}>
        {piece.shape.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "border border-gray-200",
                cell ? getPlayerColor(currentPlayer) : "bg-transparent"
              )}
              style={{ width: size, height: size }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel w-full">
      <h3 className="text-sm font-medium mb-2">Your Pieces</h3>
      
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {displayedPieces.map((piece) => (
          <button
            key={piece.id}
            onClick={() => onSelectPiece(piece)}
            disabled={piece.used || piece.hidden}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 bg-white/90 border",
              (piece.used || piece.hidden) ? "opacity-50 cursor-not-allowed" : "hover:shadow-md active:scale-95",
              selectedPiece?.id === piece.id ? "ring-2 ring-primary shadow-lg scale-105" : "border-gray-200"
            )}
          >
            {renderPieceShape(piece)}
          </button>
        ))}
        
        {availablePieces.length === 0 && (
          <div className="text-center text-gray-500 py-2 w-full">
            No pieces available
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="h-8 w-8 p-0"
          >
            &lt;
          </Button>
          <span className="text-sm flex items-center">
            {page + 1} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
            className="h-8 w-8 p-0"
          >
            &gt;
          </Button>
        </div>
      )}
      
      {selectedPiece && (
        <div className="flex justify-center space-x-3 mt-2">
          <Button 
            onClick={onRotatePiece} 
            variant="outline"
            size="sm"
            className="control-button"
          >
            <RotateCw className="h-4 w-4 mr-1" /> Rotate
          </Button>
          <Button 
            onClick={onFlipPiece} 
            variant="outline"
            size="sm"
            className="control-button"
          >
            <FlipHorizontal className="h-4 w-4 mr-1" /> Flip
          </Button>
        </div>
      )}
      
      {selectedPiece && (
        <div className="mt-4 flex justify-center">
          <div className="glass-panel p-2 bg-white/60">
            <p className="text-xs text-center font-medium mb-1">Selected:</p>
            <div className="flex justify-center">
              {renderPieceShape(selectedPiece, 18)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieceSelector;
