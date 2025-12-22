import {
  getAllPossibleMoves,
  applyMove,
  hasLegalMoves
} from './moveValidation';
import { PLAYER_COLORS, PIECE_TYPES, AI_DIFFICULTY } from '../constants';

const evaluateBoard = (board, aiColor) => {
  let score = 0;
  const opponentColor = aiColor === PLAYER_COLORS.RED ? PLAYER_COLORS.BLACK : PLAYER_COLORS.RED;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      let pieceValue = piece.type === PIECE_TYPES.KING ? 3 : 1;

      if (piece.color === aiColor) {
        score += pieceValue;
        if (piece.type === PIECE_TYPES.NORMAL) {
          if (aiColor === PLAYER_COLORS.RED) {
            score += (7 - row) * 0.1;
          } else {
            score += row * 0.1;
          }
        }
      } else {
        score -= pieceValue;
      }
    }
  }

  if (!hasLegalMoves(board, opponentColor)) {
    score += 100;
  }

  return score;
};

const minimax = (board, depth, alpha, beta, isMaximizing, aiColor) => {
  const opponentColor = aiColor === PLAYER_COLORS.RED ? PLAYER_COLORS.BLACK : PLAYER_COLORS.RED;
  const currentColor = isMaximizing ? aiColor : opponentColor;

  if (depth === 0 || !hasLegalMoves(board, currentColor)) {
    return evaluateBoard(board, aiColor);
  }

  const moves = getAllPossibleMoves(board, currentColor);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const { newBoard } = applyMove(board, move.from.row, move.from.col, move.to.row, move.to.col);
      const score = minimax(newBoard, depth - 1, alpha, beta, false, aiColor);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const { newBoard } = applyMove(board, move.from.row, move.from.col, move.to.row, move.to.col);
      const score = minimax(newBoard, depth - 1, alpha, beta, true, aiColor);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
};

const getEasyMove = (board, aiColor) => {
  const moves = getAllPossibleMoves(board, aiColor);
  if (moves.length === 0) return null;

  const captureMoves = moves.filter(m => m.isCapture);

  if (captureMoves.length > 0) {
    return captureMoves[Math.floor(Math.random() * captureMoves.length)];
  }

  return moves[Math.floor(Math.random() * moves.length)];
};

const getMediumMove = (board, aiColor) => {
  const moves = getAllPossibleMoves(board, aiColor);
  if (moves.length === 0) return null;

  const captureMoves = moves.filter(m => m.isCapture);

  if (captureMoves.length > 0) {
    let bestMove = captureMoves[0];
    let bestScore = -Infinity;

    for (const move of captureMoves) {
      const { newBoard } = applyMove(board, move.from.row, move.from.col, move.to.row, move.to.col);
      const score = evaluateBoard(newBoard, aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const { newBoard } = applyMove(board, move.from.row, move.from.col, move.to.row, move.to.col);
    const score = evaluateBoard(newBoard, aiColor);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const getHardMove = (board, aiColor) => {
  const moves = getAllPossibleMoves(board, aiColor);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const { newBoard } = applyMove(board, move.from.row, move.from.col, move.to.row, move.to.col);
    const score = minimax(newBoard, 4, -Infinity, Infinity, false, aiColor);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

export const getAIMove = (board, aiColor, difficulty = AI_DIFFICULTY.MEDIUM) => {
  switch (difficulty) {
    case AI_DIFFICULTY.EASY:
      return getEasyMove(board, aiColor);
    case AI_DIFFICULTY.MEDIUM:
      return getMediumMove(board, aiColor);
    case AI_DIFFICULTY.HARD:
      return getHardMove(board, aiColor);
    default:
      return getMediumMove(board, aiColor);
  }
};

export const getHint = (board, playerColor) => {
  return getMediumMove(board, playerColor);
};
