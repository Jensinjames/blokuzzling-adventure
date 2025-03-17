
import { GameState, Piece, BoardPosition } from '@/types/game';
import { validatePiecePlacement } from './boardValidation';
import { rotatePiece, flipPiece } from './pieceManipulation';
import { BOARD_SIZE, PIECE_SHAPES, powerupCorners } from './gameConstants';

export const hasValidMoves = (gameState: GameState, playerIndex: number): boolean => {
  const player = gameState.players[playerIndex];
  const unusedPieces = player.pieces.filter(p => !p.used);
  
  if (unusedPieces.length === 0) {
    return false;
  }
  
  // Check if the player can place any piece anywhere
  for (const piece of unusedPieces) {
    // Try all possible rotations and flips
    let currentPiece = { ...piece };
    let possibleShapes = [];
    
    // Original shape
    possibleShapes.push(currentPiece.shape);
    
    // 90 degree rotation
    currentPiece.shape = rotatePiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // 180 degree rotation
    currentPiece.shape = rotatePiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // 270 degree rotation
    currentPiece.shape = rotatePiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // Flipped
    currentPiece.shape = flipPiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // Flipped + 90 degree
    currentPiece.shape = rotatePiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // Flipped + 180 degree
    currentPiece.shape = rotatePiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // Flipped + 270 degree
    currentPiece.shape = rotatePiece(currentPiece);
    possibleShapes.push(currentPiece.shape);
    
    // Try all shapes at all positions
    for (const shape of possibleShapes) {
      currentPiece.shape = shape;
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (validatePiecePlacement(
            currentPiece,
            { row, col },
            gameState.board,
            playerIndex
          )) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

export const createInitialGameState = (numPlayers = 2): GameState => {
  // Create empty board
  const board = Array(BOARD_SIZE).fill(0).map(() => 
    Array(BOARD_SIZE).fill(0).map(() => ({ player: null }))
  );
  
  // Create players with their pieces
  const players = Array(numPlayers).fill(0).map((_, i) => {
    const playerPieces = PIECE_SHAPES.map((shape, shapeIndex) => ({
      id: `p${i}-${shapeIndex}`,
      shape,
      name: `Piece ${shapeIndex + 1}`,
      used: false
    }));
    
    return {
      id: i,
      name: `Player ${i + 1}`,
      color: `player${i + 1}`,
      moveHistory: [],
      pieces: playerPieces,
      score: 0,
      powerups: []
    };
  });
  
  // Add powerups to the board for 2-player games
  if (numPlayers === 2) {
    powerupCorners.forEach(corner => {
      board[corner.row][corner.col] = {
        player: null,
        hasPowerup: true,
        powerupType: 'destroy'
      };
    });
  }
  
  // For 2 players, ensure they start at opposite corners (player 0 and 1)
  // For more players, the default corner assignment works fine
  const currentPlayer = 0; // Always start with player 0
  
  return {
    board,
    players,
    currentPlayer,
    turnHistory: [],
    gameStats: {
      totalMoves: 0,
      gameStartTime: Date.now(),
      lastMoveTime: Date.now()
    },
    gameStatus: 'playing',
    winner: null,
    powerupCells: numPlayers === 2 ? [...powerupCorners] : []
  };
};
