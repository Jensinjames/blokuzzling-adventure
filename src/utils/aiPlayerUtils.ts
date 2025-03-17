
import { GameState, Piece, BoardPosition } from '@/types/game';
import { validatePiecePlacement, isWithinBounds } from './boardValidation';
import { rotatePiece, flipPiece } from './pieceManipulation';
import { BOARD_SIZE } from './gameConstants';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Function to find the best move for the AI player
export const findAIMove = (
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): { piece: Piece; position: BoardPosition; } | null => {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const unusedPieces = aiPlayer.pieces.filter(p => !p.used);
  
  if (unusedPieces.length === 0) {
    return null;
  }
  
  // Get all possible moves
  const possibleMoves: Array<{
    piece: Piece;
    position: BoardPosition;
    score: number;
  }> = [];
  
  // For each piece, find all valid placements
  for (const piece of unusedPieces) {
    // Try different rotations and flips based on difficulty
    const rotationOptions = getRotationOptions(difficulty);
    const flipOptions = getFlipOptions(difficulty);
    
    for (const rotations of rotationOptions) {
      // Apply rotations
      let modifiedPiece = { ...piece, shape: [...piece.shape.map(row => [...row])] };
      for (let r = 0; r < rotations; r++) {
        modifiedPiece.shape = rotatePiece(modifiedPiece);
      }
      
      for (const shouldFlip of flipOptions) {
        // Create a copy to avoid mutating the original
        let finalPiece = { 
          ...modifiedPiece, 
          shape: [...modifiedPiece.shape.map(row => [...row])] 
        };
        
        // Apply flip if needed
        if (shouldFlip) {
          finalPiece.shape = flipPiece(finalPiece);
        }
        
        // Check all possible positions on the board
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            const position: BoardPosition = { row, col };
            
            if (validatePiecePlacement(
              finalPiece,
              position,
              gameState.board,
              aiPlayerIndex
            )) {
              // Calculate a score for this move based on difficulty
              const score = calculateMoveScore(
                finalPiece,
                position,
                gameState,
                aiPlayerIndex,
                difficulty
              );
              
              possibleMoves.push({
                piece: {
                  ...finalPiece,
                  id: piece.id,
                  name: piece.name,
                  used: piece.used
                },
                position,
                score
              });
            }
          }
        }
      }
    }
  }
  
  if (possibleMoves.length === 0) {
    return null;
  }
  
  // Choose the move based on difficulty
  return chooseMove(possibleMoves, difficulty);
};

// Helper function to get rotation options based on difficulty
const getRotationOptions = (difficulty: AIDifficulty): number[] => {
  switch (difficulty) {
    case 'easy':
      // Easy AI only tries the original orientation and 90-degree rotation
      return [0, 1];
    case 'medium':
      // Medium AI tries all four rotations
      return [0, 1, 2, 3];
    case 'hard':
      // Hard AI tries all four rotations
      return [0, 1, 2, 3];
  }
};

// Helper function to get flip options based on difficulty
const getFlipOptions = (difficulty: AIDifficulty): boolean[] => {
  switch (difficulty) {
    case 'easy':
      // Easy AI doesn't try flipping
      return [false];
    case 'medium':
      // Medium AI tries with and without flipping
      return [false, true];
    case 'hard':
      // Hard AI tries with and without flipping
      return [false, true];
  }
};

// Calculate a score for a potential move
const calculateMoveScore = (
  piece: Piece,
  position: BoardPosition,
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): number => {
  let score = 0;
  
  // Base score: number of cells in the piece (so bigger pieces are preferred)
  const pieceSize = piece.shape.flat().filter(cell => cell === 1).length;
  score += pieceSize;
  
  // Check if the move would collect a powerup
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        if (isWithinBounds(boardRow, boardCol) && 
            gameState.board[boardRow][boardCol].hasPowerup) {
          // Collecting powerups is good
          score += 10;
        }
      }
    }
  }
  
  // For medium and hard difficulties, add strategic considerations
  if (difficulty === 'medium' || difficulty === 'hard') {
    // Prefer moves that block the center of the board
    score += calculateCentralityScore(piece, position);
    
    // For hard difficulty, look ahead to block opponent moves
    if (difficulty === 'hard') {
      score += calculateBlockingScore(piece, position, gameState, aiPlayerIndex);
    }
  }
  
  return score;
};

// Calculate how central the placement is (center placements are better strategically)
const calculateCentralityScore = (piece: Piece, position: BoardPosition): number => {
  const centerRow = Math.floor(BOARD_SIZE / 2);
  const centerCol = Math.floor(BOARD_SIZE / 2);
  
  // Calculate distance from center for each cell of the piece
  let totalDistance = 0;
  let cellCount = 0;
  
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const rowDist = Math.abs((position.row + i) - centerRow);
        const colDist = Math.abs((position.col + j) - centerCol);
        totalDistance += (rowDist + colDist);
        cellCount++;
      }
    }
  }
  
  // Invert the score so that smaller distances (more central) get higher scores
  const averageDistance = cellCount > 0 ? totalDistance / cellCount : 0;
  return Math.max(0, 5 - averageDistance); // Bonus of 0-5 based on centrality
};

// Calculate how effectively this move blocks opponent moves
const calculateBlockingScore = (
  piece: Piece,
  position: BoardPosition,
  gameState: GameState,
  aiPlayerIndex: number
): number => {
  let blockingScore = 0;
  
  // Simulate placing this piece
  const simulatedBoard = JSON.parse(JSON.stringify(gameState.board));
  
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        if (isWithinBounds(boardRow, boardCol)) {
          simulatedBoard[boardRow][boardCol] = { player: aiPlayerIndex };
        }
      }
    }
  }
  
  // Check if this placement blocks opponent diagonal connections
  // Examine adjacent diagonal cells
  const diagonalDirections = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];
  
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = position.row + i;
        const boardCol = position.col + j;
        
        // Check diagonals for opponent pieces
        for (const dir of diagonalDirections) {
          const adjRow = boardRow + dir.row;
          const adjCol = boardCol + dir.col;
          
          if (isWithinBounds(adjRow, adjCol) && 
              gameState.board[adjRow][adjCol].player !== null &&
              gameState.board[adjRow][adjCol].player !== aiPlayerIndex) {
            // We found an opponent piece diagonally adjacent
            // This is a good blocking move
            blockingScore += 2;
          }
        }
      }
    }
  }
  
  return blockingScore;
};

// Choose a move from the list of possible moves
const chooseMove = (
  possibleMoves: Array<{ piece: Piece; position: BoardPosition; score: number; }>,
  difficulty: AIDifficulty
): { piece: Piece; position: BoardPosition; } => {
  // Sort moves by score (highest first)
  const sortedMoves = [...possibleMoves].sort((a, b) => b.score - a.score);
  
  switch (difficulty) {
    case 'easy':
      // Easy AI randomly picks from the top 60% of moves
      const easyIndex = Math.floor(Math.random() * Math.ceil(sortedMoves.length * 0.6));
      return {
        piece: sortedMoves[easyIndex].piece,
        position: sortedMoves[easyIndex].position
      };
      
    case 'medium':
      // Medium AI randomly picks from the top 30% of moves
      const mediumIndex = Math.floor(Math.random() * Math.ceil(sortedMoves.length * 0.3));
      return {
        piece: sortedMoves[mediumIndex].piece,
        position: sortedMoves[mediumIndex].position
      };
      
    case 'hard':
      // Hard AI usually picks the best move, but occasionally (20% chance) picks the 2nd best move
      const randomFactor = Math.random();
      const index = randomFactor > 0.8 && sortedMoves.length > 1 ? 1 : 0;
      return {
        piece: sortedMoves[index].piece,
        position: sortedMoves[index].position
      };
  }
};
