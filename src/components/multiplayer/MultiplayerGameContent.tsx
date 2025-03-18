
import React from 'react';
import { GameState, BoardPosition, Piece } from '@/types/game';
import { useIsMobile } from '@/hooks/use-mobile';

import TurnIndicator from '@/components/multiplayer/TurnIndicator';
import PowerupActiveIndicator from '@/components/multiplayer/PowerupActiveIndicator';
import PlayerInfo from '@/components/PlayerInfo';
import GameResult from '@/components/GameResult';
import MultiplayerGameBoard from '@/components/multiplayer/GameBoard';
import MultiplayerGameControls from '@/components/multiplayer/GameControls';
import PieceSelectorWrapper from '@/components/multiplayer/PieceSelectorWrapper';

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
  const isMobile = useIsMobile();
  
  return (
    <>
      <PowerupActiveIndicator 
        isActive={isPowerupActive} 
        isMyTurn={isMyTurn}
        powerupType={activePowerupType}
        onCancel={cancelPowerupMode}
      />
      
      <TurnIndicator 
        gameState={gameState}
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        activePowerupType={activePowerupType}
      />
      
      <MultiplayerGameBoard
        gameState={gameState}
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        selectedPiece={selectedPiece}
        previewPosition={previewPosition}
        isValidPlacement={isValidPlacement}
        onCellClick={onCellClick}
        onCellHover={onCellHover}
      />
      
      <PieceSelectorWrapper
        isMyTurn={isMyTurn}
        isPowerupActive={isPowerupActive}
        playerNumber={playerNumber}
        pieces={gameState.players[playerNumber || 0]?.pieces || []}
        selectedPiece={selectedPiece}
        onSelectPiece={onSelectPiece}
        onRotatePiece={onRotatePiece}
        onFlipPiece={onFlipPiece}
      />
      
      <MultiplayerGameControls
        isMyTurn={isMyTurn}
        turnHistoryLength={gameState.turnHistory.length}
        gameStatus={gameState.gameStatus}
        onUndo={onUndo}
        onReset={onReset}
        onPass={onPass}
        onHome={onHome}
      />
    </>
  );
};

export default MultiplayerGameContent;
