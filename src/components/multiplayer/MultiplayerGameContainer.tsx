
import React from 'react';
import { GameState, BoardPosition, Piece } from '@/types/game';
import MultiplayerHeader from './MultiplayerHeader';
import MultiplayerGameContent from './MultiplayerGameContent';

interface MultiplayerGameContainerProps {
  gameState: GameState;
  playerNumber: number | null;
  isMyTurn: boolean;
  selectedPiece: Piece | null;
  previewPosition: BoardPosition | null;
  isValidPlacement: boolean;
  isPowerupActive: boolean;
  activePowerupType: string | null;
  onCellClick: (position: BoardPosition) => void;
  onCellHover: (position: BoardPosition) => void;
  onSelectPiece: (piece: Piece) => void;
  onRotatePiece: () => void;
  onFlipPiece: () => void;
  onUndo: () => void;
  onReset: () => void;
  onPass: () => void;
  onHome: () => void;
  onUsePowerup: (playerId: number, powerupType: string) => void;
  cancelPowerupMode: () => void;
}

const MultiplayerGameContainer: React.FC<MultiplayerGameContainerProps> = ({
  gameState,
  playerNumber,
  isMyTurn,
  selectedPiece,
  previewPosition,
  isValidPlacement,
  isPowerupActive,
  activePowerupType,
  onCellClick,
  onCellHover,
  onSelectPiece,
  onRotatePiece,
  onFlipPiece,
  onUndo,
  onReset,
  onPass,
  onHome,
  onUsePowerup,
  cancelPowerupMode
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-2 md:p-6">
      <div className="max-w-5xl mx-auto">
        <MultiplayerHeader 
          gameState={gameState}
          isMyTurn={isMyTurn}
          playerNumber={playerNumber}
          onHome={onHome}
        />
        
        <div className="mt-4">
          <MultiplayerGameContent
            gameState={gameState}
            playerNumber={playerNumber}
            isMyTurn={isMyTurn}
            selectedPiece={selectedPiece}
            previewPosition={previewPosition}
            isValidPlacement={isValidPlacement}
            isPowerupActive={isPowerupActive}
            activePowerupType={activePowerupType}
            onCellClick={onCellClick}
            onCellHover={onCellHover}
            onSelectPiece={onSelectPiece}
            onRotatePiece={onRotatePiece}
            onFlipPiece={onFlipPiece}
            onUndo={onUndo}
            onReset={onReset}
            onPass={onPass}
            onHome={onHome}
            cancelPowerupMode={cancelPowerupMode}
            onUsePowerup={onUsePowerup}
          />
        </div>
      </div>
    </div>
  );
}

export default MultiplayerGameContainer;
