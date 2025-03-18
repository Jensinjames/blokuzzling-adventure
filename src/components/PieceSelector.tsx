
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Piece } from '@/types/game';
import { Button } from '@/components/ui/button';
import { RotateCw, FlipHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getPieceDisplayDimensions } from '@/utils/pieceManipulation';

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
  const [displayedPieces, setDisplayedPieces] = useState<Piece[]>([]);
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  
  // Group pieces by category for better organization
  const [piecesByCategory, setPiecesByCategory] = useState<Record<string, Piece[]>>({});
  
  // Organize pieces by category
  useEffect(() => {
    const categorized: Record<string, Piece[]> = {};
    
    availablePieces.forEach(piece => {
      const category = piece.category || 'unknown';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(piece);
    });
    
    setPiecesByCategory(categorized);
  }, [availablePieces]);
  
  // Number of pieces to display per page based on screen size
  const piecesPerPage = isMobile ? 3 : 5;
  
  // Calculate total pages only once when available pieces change
  const totalPages = Math.ceil(availablePieces.length / piecesPerPage);
  
  // Update displayed pieces whenever available pieces or page changes
  useEffect(() => {
    const startIdx = page * piecesPerPage;
    const endIdx = Math.min(startIdx + piecesPerPage, availablePieces.length);
    setDisplayedPieces(availablePieces.slice(startIdx, endIdx));
  }, [availablePieces, page, piecesPerPage]);
  
  const getPlayerColor = (player: number): string => {
    const colors = ['bg-player1', 'bg-player2', 'bg-player3', 'bg-player4'];
    return colors[player % colors.length];
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const renderPieceShape = useCallback((piece: Piece, size: number = 24) => {
    if (!piece.shape || !piece.shape.length) return null;
    
    const cellSize = isMobile ? Math.max(16, size - 8) : size;
    
    return (
      <div className="piece-grid transition-all duration-200" style={{
        display: 'grid',
        gridTemplateRows: `repeat(${piece.shape.length}, ${cellSize}px)`,
        gridTemplateColumns: `repeat(${piece.shape[0].length}, ${cellSize}px)`,
      }}>
        {piece.shape.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "border border-gray-200",
                cell ? getPlayerColor(currentPlayer) : "bg-transparent"
              )}
              style={{ width: cellSize, height: cellSize }}
            />
          ))
        )}
      </div>
    );
  }, [currentPlayer, isMobile, getPlayerColor]);

  return (
    <div className="glass-panel w-full">
      <h3 className="text-sm font-medium mb-2">Your Pieces</h3>
      
      <ScrollArea className="w-full" type="always">
        <div className="flex flex-wrap justify-center mb-4 min-h-[120px]">
          {displayedPieces.map((piece) => (
            <TooltipProvider key={piece.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectPiece(piece)}
                    disabled={piece.used || piece.hidden}
                    className={cn(
                      "p-2 m-1 rounded-lg transition-all duration-200 bg-white/90 border",
                      (piece.used || piece.hidden) ? "opacity-50 cursor-not-allowed" : "hover:shadow-md active:scale-95",
                      selectedPiece?.id === piece.id ? "ring-2 ring-primary shadow-lg scale-105" : "border-gray-200"
                    )}
                  >
                    {renderPieceShape(piece, isMobile ? 20 : 24)}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{piece.name}</p>
                  {piece.category && <p className="text-xs text-gray-500">{piece.category}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {availablePieces.length === 0 && (
            <div className="text-center text-gray-500 py-2 w-full">
              No pieces available
            </div>
          )}
        </div>
      </ScrollArea>
      
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm flex items-center">
            {page + 1} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1 || totalPages === 0}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="h-4 w-4" />
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
            <RotateCw className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Rotate</span>}
          </Button>
          <Button 
            onClick={onFlipPiece} 
            variant="outline"
            size="sm"
            className="control-button"
          >
            <FlipHorizontal className="h-4 w-4" />
            {!isMobile && <span className="ml-1">Flip</span>}
          </Button>
        </div>
      )}
      
      {selectedPiece && (
        <div className="mt-4 flex justify-center">
          <div className="glass-panel p-2 bg-white/60">
            <p className="text-xs text-center font-medium mb-1">Selected: {selectedPiece.name}</p>
            <div className="flex justify-center">
              {renderPieceShape(selectedPiece, isMobile ? 16 : 18)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieceSelector;
