
import { GameState, Piece, BoardPosition, BoardCell } from '@/types/game';
import { validatePiecePlacement } from './boardValidation';
import { rotatePiece, flipPiece, updatePieceState } from './pieceManipulation';
import { BOARD_SIZE, powerupCorners } from './gameConstants';
import { generatePlayerPieces, getPieceStateId } from './pieceUtils';

// Cache for validation results to improve performance
const validationCache = new Map<string, boolean>();

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
    const originalShape = currentPiece.shape;
    possibleShapes.push({ shape: originalShape, stateId: getPieceStateId(currentPiece) });
    
    // 90 degree rotation
    let rotated90 = rotatePiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, rotated90, 'rotate');
    possibleShapes.push({ shape: rotated90, stateId: getPieceStateId(currentPiece) });
    
    // 180 degree rotation
    let rotated180 = rotatePiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, rotated180, 'rotate');
    possibleShapes.push({ shape: rotated180, stateId: getPieceStateId(currentPiece) });
    
    // 270 degree rotation
    let rotated270 = rotatePiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, rotated270, 'rotate');
    possibleShapes.push({ shape: rotated270, stateId: getPieceStateId(currentPiece) });
    
    // Flipped
    let flipped = flipPiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, flipped, 'flip');
    possibleShapes.push({ shape: flipped, stateId: getPieceStateId(currentPiece) });
    
    // Flipped + 90 degree
    let flippedRotated90 = rotatePiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, flippedRotated90, 'rotate');
    possibleShapes.push({ shape: flippedRotated90, stateId: getPieceStateId(currentPiece) });
    
    // Flipped + 180 degree
    let flippedRotated180 = rotatePiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, flippedRotated180, 'rotate');
    possibleShapes.push({ shape: flippedRotated180, stateId: getPieceStateId(currentPiece) });
    
    // Flipped + 270 degree
    let flippedRotated270 = rotatePiece(currentPiece);
    currentPiece = updatePieceState(currentPiece, flippedRotated270, 'rotate');
    possibleShapes.push({ shape: flippedRotated270, stateId: getPieceStateId(currentPiece) });
    
    // Try all shapes at all positions with caching
    for (const { shape, stateId } of possibleShapes) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          // Create a unique cache key for this validation state
          const position = { row, col };
          const cacheKey = `${stateId}-${row}-${col}-${playerIndex}`;
          
          // Check cache first
          if (validationCache.has(cacheKey)) {
            if (validationCache.get(cacheKey)) {
              return true;
            }
            continue;
          }
          
          // Validate and cache the result
          const isValid = validatePiecePlacement(
            { ...currentPiece, shape },
            position,
            gameState.board,
            playerIndex
          );
          
          validationCache.set(cacheKey, isValid);
          
          if (isValid) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

export const createInitialGameState = (numPlayers = 2): GameState => {
  // Clear validation cache on new game
  validationCache.clear();
  
  // Create empty board
  const board = Array(BOARD_SIZE).fill(0).map(() => 
    Array(BOARD_SIZE).fill(0).map(() => ({ player: null } as BoardCell))
  );
  
  // Create players with their pieces
  const players = Array(numPlayers).fill(0).map((_, i) => {
    // Use our new piece generation utility
    const playerPieces = generatePlayerPieces(i);
    
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
    powerupCells: numPlayers === 2 ? [...powerupCorners] : [],
    version: 0,
    lastUpdate: Date.now()
  };
};
