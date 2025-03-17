
import React from 'react';
import { toast } from 'sonner';
import { GameState, BoardPosition, Piece } from '@/types/game';
import { BOARD_SIZE } from '@/utils/gameUtils';
import GameBoard from '@/components/GameBoard';
import PieceSelector from '@/components/PieceSelector';
import GameControls from '@/components/GameControls';
import TurnIndicator from '@/components/multiplayer/TurnIndicator';
import PowerupActiveIndicator from '@/components/multiplayer/PowerupActiveIndicator';

interface MultiplayerGameContentProps {
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
  cancelPowerupMode: () => void;
}

const MultiplayerGameContent: React.FC<MultiplayerGameContentProps> = ({
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
  cancelPowerupMode
}) => {
  // Helper function to handle board cell clicks
  const handleBoardCellClick = (position: BoardPosition) => {
    if (!isMyTurn) {
      toast.info("It's not your turn");
      return;
    }
    onCellClick(position);
  };

  return (
    <>
      <PowerupActiveIndicator 
        isActive={isPowerupActive} 
        isMyTurn={isMyTurn}
        powerupType={activePowerupType}
        onCancel={cancelPowerupMode}
      />
      
      <GameBoard
        gameState={gameState}
        size={BOARD_SIZE}
        onCellClick={handleBoardCellClick}
        selectedPiecePreview={isPowerupActive ? null : selectedPiece}
        previewPosition={previewPosition}
        isValidPlacement={isValidPlacement && isMyTurn}
        onCellHover={onCellHover}
        isPowerupActive={isPowerupActive}
      />
      
      <TurnIndicator 
        gameState={gameState}
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        activePowerupType={activePowerupType}
      />
      
      {isMyTurn && !isPowerupActive && (
        <PieceSelector
          pieces={gameState.players[playerNumber || 0]?.pieces || []}
          currentPlayer={playerNumber || 0}
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
          onPass={isMyTurn ? onPass : () => toast.info("It's not your turn")}
          onHome={onHome}
          canUndo={isMyTurn && gameState.turnHistory.length > 0}
          isGameOver={["finished", "completed"].includes(gameState.gameStatus)}
        />
      </div>
    </>
  );
};

export default MultiplayerGameContent;
