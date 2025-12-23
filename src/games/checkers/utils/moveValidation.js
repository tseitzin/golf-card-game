import { BOARD_SIZE, PLAYER_COLORS, PIECE_TYPES } from '../constants';

export const isValidSquare = (row, col) => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const isDarkSquare = (row, col) => {
  return (row + col) % 2 === 1;
};

export const getValidMoves = (board, row, col) => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const captures = [];

  const directions = piece.type === PIECE_TYPES.KING
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.color === PLAYER_COLORS.RED
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (isValidSquare(newRow, newCol) && !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol, isCapture: false });
    }

    const captureRow = row + dRow * 2;
    const captureCol = col + dCol * 2;
    const middleRow = row + dRow;
    const middleCol = col + dCol;

    if (
      isValidSquare(captureRow, captureCol) &&
      !board[captureRow][captureCol] &&
      board[middleRow][middleCol] &&
      board[middleRow][middleCol].color !== piece.color
    ) {
      captures.push({
        row: captureRow,
        col: captureCol,
        isCapture: true,
        capturedPiece: { row: middleRow, col: middleCol }
      });
    }
  }

  return [...captures, ...moves];
};

export const getAllCaptures = (board, color) => {
  const captures = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col);
        const pieceCaptures = moves.filter(m => m.isCapture);
        if (pieceCaptures.length > 0) {
          captures.push({ row, col, captures: pieceCaptures });
        }
      }
    }
  }

  return captures;
};

export const hasAnyCaptures = (board, color) => {
  return getAllCaptures(board, color).length > 0;
};

export const getValidMovesForPiece = (board, row, col) => {
  const piece = board[row][col];
  if (!piece) return [];

  return getValidMoves(board, row, col);
};

export const canContinueCapture = (board, row, col) => {
  const moves = getValidMoves(board, row, col);
  return moves.some(m => m.isCapture);
};

export const applyMove = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];

  newBoard[toRow][toCol] = { ...piece };
  newBoard[fromRow][fromCol] = null;

  const rowDiff = Math.abs(toRow - fromRow);
  let capturedPiece = null;

  if (rowDiff === 2) {
    const middleRow = (fromRow + toRow) / 2;
    const middleCol = (fromCol + toCol) / 2;
    capturedPiece = { row: middleRow, col: middleCol, piece: newBoard[middleRow][middleCol] };
    newBoard[middleRow][middleCol] = null;
  }

  if (
    (piece.color === PLAYER_COLORS.RED && toRow === 0) ||
    (piece.color === PLAYER_COLORS.BLACK && toRow === BOARD_SIZE - 1)
  ) {
    newBoard[toRow][toCol].type = PIECE_TYPES.KING;
  }

  return { newBoard, capturedPiece };
};

export const getAllPossibleMoves = (board, color) => {
  const moves = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const pieceMoves = getValidMoves(board, row, col);
        pieceMoves.forEach(move => {
          moves.push({
            from: { row, col },
            to: { row: move.row, col: move.col },
            isCapture: move.isCapture,
            capturedPiece: move.capturedPiece
          });
        });
      }
    }
  }

  return moves;
};

export const hasLegalMoves = (board, color) => {
  return getAllPossibleMoves(board, color).length > 0;
};

export const countPieces = (board, color) => {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] && board[row][col].color === color) {
        count++;
      }
    }
  }
  return count;
};
