import { BoardCell, BoardPosition, GameState, Piece } from '@/types/game';

export const BOARD_SIZE = 14;

export const PIECE_SHAPES = [
  // 1x1
  [[1]],
  
  // 2x1
  [[1, 1]],
  
  // 3x1
  [[1, 1, 1]],
  
  // 4x1
  [[1, 1, 1, 1]],
  
  // 5x1
  [[1, 1, 1, 1, 1]],
  
  // L shapes
  [
    [1, 0],
    [1, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [1, 1, 1, 1],
    [1, 0, 0, 0]
  ],
  
  // T shapes
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  
  // Z shapes
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  
  // Square shapes
  [
    [1, 1],
    [1, 1]
  ],
  
  // More complex shapes
  [
    [1, 1, 1],
    [1, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1]
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1]
  ]
];

// Modified starting corners to ensure players start at opposite corners
export const startingCorners: BoardPosition[] = [
  { row: 0, col: 0 },                    // Player 0: top-left
  { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 }, // Player 1: bottom-right
  { row: BOARD_SIZE - 1, col: 0 },             // Player 2: bottom-left
  { row: 0, col: BOARD_SIZE - 1 },             // Player 3: top-right
];

export const getStartingCorner = (currentPlayer: number): BoardPosition => startingCorners[currentPlayer];

export const isWithinBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const validatePiecePlacement = (
  piece: Piece,
  boardPosition: BoardPosition,
  board: BoardCell[][],
  currentPlayer: number
): boolean => {
  if (!piece || !boardPosition) return false;
  
  // Check if piece is within bounds
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check if within board bounds
        if (!isWithinBounds(boardRow, boardCol)) {
          return false;
        }
        
        // Check if cell is already occupied
        if (board[boardRow][boardCol].player !== null) {
          return false;
        }
      }
    }
  }
  
  // Check if this is the first piece for this player
  const hasPlacedPiece = board.some(row => row.some(cell => cell.player === currentPlayer));
  
  if (!hasPlacedPiece) {
    // First piece must cover the starting corner
    const requiredCorner = getStartingCorner(currentPlayer);
    return coversStartingCorner(piece, boardPosition, requiredCorner);
  } else {
    // Subsequent pieces must connect diagonally to the player's own pieces
    return touchesOwnDiagonal(piece, boardPosition, board, currentPlayer) && 
           !touchesSide(piece, boardPosition, board, currentPlayer);
  }
};

export const coversStartingCorner = (
  piece: Piece,
  boardPosition: BoardPosition,
  requiredCorner: BoardPosition
): boolean => {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        if (boardRow === requiredCorner.row && boardCol === requiredCorner.col) {
          return true;
        }
      }
    }
  }
  return false;
};

export const touchesOwnDiagonal = (
  piece: Piece,
  boardPosition: BoardPosition,
  board: BoardCell[][],
  currentPlayer: number
): boolean => {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check diagonals
        const diagonals = [
          { row: boardRow - 1, col: boardCol - 1 },
          { row: boardRow - 1, col: boardCol + 1 },
          { row: boardRow + 1, col: boardCol - 1 },
          { row: boardRow + 1, col: boardCol + 1 },
        ];
        
        for (const diag of diagonals) {
          if (isWithinBounds(diag.row, diag.col) && 
              board[diag.row][diag.col].player === currentPlayer) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export const touchesSide = (
  piece: Piece,
  boardPosition: BoardPosition,
  board: BoardCell[][],
  currentPlayer: number
): boolean => {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j] === 1) {
        const boardRow = boardPosition.row + i;
        const boardCol = boardPosition.col + j;
        
        // Check orthogonal adjacency
        const adjacents = [
          { row: boardRow - 1, col: boardCol },
          { row: boardRow + 1, col: boardCol },
          { row: boardRow, col: boardCol - 1 },
          { row: boardRow, col: boardCol + 1 },
        ];
        
        for (const adj of adjacents) {
          if (isWithinBounds(adj.row, adj.col) && 
              board[adj.row][adj.col].player === currentPlayer) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export const rotatePiece = (piece: Piece): number[][] => {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  
  // Create a new rotated matrix
  const rotated: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  // Perform rotation (90 degrees clockwise)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = piece.shape[i][j];
    }
  }
  
  return rotated;
};

export const flipPiece = (piece: Piece): number[][] => {
  // Create a new flipped matrix (horizontal flip)
  return piece.shape.map(row => [...row].reverse());
};

export const calculateScore = (pieces: Piece[]): number => {
  let score = 0;
  
  // Calculate score based on remaining unused pieces
  for (const piece of pieces) {
    if (!piece.used) {
      // Count the number of cells in the piece
      const cellCount = piece.shape.reduce((acc, row) => 
        acc + row.reduce((sum, cell) => sum + cell, 0), 0);
      
      // Subtract from score
      score -= cellCount;
    } else {
      // Add to score based on the size of the piece
      const cellCount = piece.shape.reduce((acc, row) => 
        acc + row.reduce((sum, cell) => sum + cell, 0), 0);
      
      score += cellCount;
    }
  }
  
  return score;
};

export const checkGameOver = (gameState: GameState): boolean => {
  for (let playerIndex = 0; playerIndex < gameState.players.length; playerIndex++) {
    if (hasValidMoves(gameState, playerIndex)) {
      return false;
    }
  }
  return true;
};

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

export const determineWinner = (players: GameState['players']): number | null => {
  if (players.length === 0) return null;
  
  let maxScore = players[0].score;
  let maxPlayerIndex = 0;
  let hasTie = false;
  
  for (let i = 1; i < players.length; i++) {
    if (players[i].score > maxScore) {
      maxScore = players[i].score;
      maxPlayerIndex = i;
      hasTie = false;
    } else if (players[i].score === maxScore) {
      hasTie = true;
    }
  }
  
  return hasTie ? null : maxPlayerIndex;
};

export const createInitialGameState = (numPlayers = 2): GameState => {
  // Create empty board
  const board: BoardCell[][] = Array(BOARD_SIZE).fill(0).map(() => 
    Array(BOARD_SIZE).fill(0).map(() => ({ player: null }))
  );
  
  // Create players with their pieces
  const players = Array(numPlayers).fill(0).map((_, i) => {
    const playerPieces: Piece[] = PIECE_SHAPES.map((shape, shapeIndex) => ({
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
      score: 0
    };
  });
  
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
    winner: null
  };
};
