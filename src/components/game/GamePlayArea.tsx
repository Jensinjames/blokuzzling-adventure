
import React from 'react';
import { GameState, Piece, BoardPosition } from '@/types/game';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import GameControls from '@/components/GameControls';
import GameResult from '@/components/GameResult';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';

interface GamePlayAreaProps {
  gameState: GameState;
  selectedPiece: Piece | null;
  previewPosition: BoardPosition | null;
  isValidPlacement: boolean;
  isPowerupActive: boolean;
  activePowerupType: string | null;
  isAIThinking: boolean;
  isGameOver: boolean;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
  onSelectPiece: (piece: Piece) => void;
  onRotatePiece: () => void;
  onFlipPiece: () => void;
  onUndo: () => void;
  onReset: () => void;
  onPass: () => void;
  onHome: () => void;
  cancelPowerupMode: () => void;
}

const GamePlayArea: React.FC<GamePlayAreaProps> = ({
  gameState,
  selectedPiece,
  previewPosition,
  isValidPlacement,
  isPowerupActive,
  activePowerupType,
  isAIThinking,
  isGameOver,
  onCellClick,
  onCellHover,
  onSelectPiece,
  onRotatePiece,
  onFlipPiece,
  onUndo,
  onReset,
  onPass,
  onHome,
  cancelPowerupMode
}) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {isAIThinking && gameState.currentPlayer === 1 && (
        <div className="text-center py-2 mb-2 text-sm bg-amber-100 dark:bg-amber-900 rounded-md">
          AI is thinking...
        </div>
      )}
      
      {isPowerupActive && (
        <div className="flex justify-center mb-4">
          <Button 
            variant="destructive"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-2"
            onClick={cancelPowerupMode}
          >
            <X className="h-4 w-4" />
            {isMobile ? "Cancel" : `Cancel ${activePowerupType} Powerup`}
          </Button>
        </div>
      )}
      
      <GameBoard
        gameState={gameState}
        size={BOARD_SIZE}
        onCellClick={onCellClick}
        selectedPiecePreview={isPowerupActive ? null : selectedPiece}
        previewPosition={previewPosition}
        isValidPlacement={isValidPlacement}
        onCellHover={onCellHover}
        isPowerupActive={isPowerupActive}
      />
      
      {isGameOver ? (
        <GameResult
          players={gameState.players}
          winner={gameState.winner}
          onRestart={onReset}
          onHome={onHome}
        />
      ) : (
        <>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            {isPowerupActive 
              ? `Select a block to use ${activePowerupType} powerup` 
              : "Select a piece from your inventory"}
          </div>
          
          {!isPowerupActive && gameState.currentPlayer === 0 && (
            <PieceSelector
              pieces={gameState.players[gameState.currentPlayer].pieces}
              currentPlayer={gameState.currentPlayer}
              onSelectPiece={onSelectPiece}
              onRotatePiece={onRotatePiece}
              onFlipPiece={onFlipPiece}
              selectedPiece={selectedPiece}
            />
          )}
          
          <div className="mt-4">
            <GameControls
              onUndo={onUndo}
              onReset={onReset}
              onPass={onPass}
              onHome={onHome}
              canUndo={gameState.turnHistory.length > 0}
              isGameOver={isGameOver}
            />
          </div>
        </>
      )}
    </>
  );
};

export default GamePlayArea;
