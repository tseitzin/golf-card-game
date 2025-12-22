import { useState, useCallback, useEffect } from 'react';
import {
  createInitialBoard,
  PLAYER_COLORS,
  GAME_MODES,
  GAME_STATES,
  AI_DIFFICULTY
} from '../constants';
import {
  getValidMovesForPiece,
  hasAnyCaptures,
  applyMove,
  canContinueCapture,
  hasLegalMoves,
  countPieces
} from '../utils/moveValidation';
import { getAIMove, getHint } from '../utils/aiLogic';

export const useGameState = () => {
  const [gameState, setGameState] = useState(GAME_STATES.SETUP);
  const [board, setBoard] = useState(createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState(PLAYER_COLORS.RED);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameMode, setGameMode] = useState(GAME_MODES.HUMAN_VS_COMPUTER);
  const [humanColor, setHumanColor] = useState(PLAYER_COLORS.RED);
  const [computerColor, setComputerColor] = useState(PLAYER_COLORS.BLACK);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [multiJumpPiece, setMultiJumpPiece] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(null);
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTY.MEDIUM);

  const checkWinCondition = useCallback((newBoard, color) => {
    const opponentColor = color === PLAYER_COLORS.RED ? PLAYER_COLORS.BLACK : PLAYER_COLORS.RED;
    const opponentPieces = countPieces(newBoard, opponentColor);
    const opponentHasMoves = hasLegalMoves(newBoard, opponentColor);

    if (opponentPieces === 0 || !opponentHasMoves) {
      setWinner(color);
      setGameState(GAME_STATES.ENDED);
      return true;
    }
    return false;
  }, []);

  const executeMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    const { newBoard, capturedPiece } = applyMove(board, fromRow, fromCol, toRow, toCol);

    const moveRecord = {
      board: board.map(row => [...row]),
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      capturedPiece,
      turn: currentTurn
    };

    setHistory(prev => [...prev, moveRecord]);
    setBoard(newBoard);
    setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } });

    const wasCapture = capturedPiece !== null;

    if (wasCapture && canContinueCapture(newBoard, toRow, toCol)) {
      setMultiJumpPiece({ row: toRow, col: toCol });
      setMessage('Nice Jump! Continue capturing!');
      return { newBoard, continueCapture: true };
    }

    setMultiJumpPiece(null);

    const becameKing = newBoard[toRow][toCol].type === 'king' &&
                       board[fromRow][fromCol].type === 'normal';

    if (becameKing) {
      setMessage('You made a King!');
    } else if (wasCapture) {
      setMessage('Nice Jump!');
    }

    if (!checkWinCondition(newBoard, currentTurn)) {
      const nextTurn = currentTurn === PLAYER_COLORS.RED ? PLAYER_COLORS.BLACK : PLAYER_COLORS.RED;
      setCurrentTurn(nextTurn);

      setTimeout(() => {
        setMessage(`${nextTurn === PLAYER_COLORS.RED ? "Red" : "Black"}'s Turn!`);
      }, 1000);
    }

    return { newBoard, continueCapture: false };
  }, [board, currentTurn, checkWinCondition]);

  const selectPiece = useCallback((row, col) => {
    if (multiJumpPiece) {
      if (multiJumpPiece.row !== row || multiJumpPiece.col !== col) {
        return;
      }
    }

    const piece = board[row][col];
    if (!piece || piece.color !== currentTurn) {
      return;
    }

    if (gameMode === GAME_MODES.HUMAN_VS_COMPUTER && currentTurn !== humanColor) {
      return;
    }

    const mustCapture = hasAnyCaptures(board, currentTurn);
    const moves = getValidMovesForPiece(board, row, col, mustCapture);

    if (moves.length === 0) {
      return;
    }

    setSelectedPiece({ row, col });
    setValidMoves(moves);
  }, [board, currentTurn, gameMode, humanColor, multiJumpPiece]);

  const movePiece = useCallback((toRow, toCol) => {
    if (!selectedPiece) return;

    const move = validMoves.find(m => m.row === toRow && m.col === toCol);
    if (!move) return;

    executeMove(selectedPiece.row, selectedPiece.col, toRow, toCol);
    setSelectedPiece(null);
    setValidMoves([]);
  }, [selectedPiece, validMoves, executeMove]);

  const undoMove = useCallback(() => {
    if (history.length === 0) return;

    const lastRecord = history[history.length - 1];

    if (gameMode === GAME_MODES.HUMAN_VS_COMPUTER && lastRecord.turn !== humanColor) {
      if (history.length < 2) return;
      const prevHistory = history.slice(0, -2);
      const prevRecord = prevHistory[prevHistory.length - 1];
      setBoard(prevRecord ? prevRecord.board : createInitialBoard());
      setHistory(prevHistory);
      setCurrentTurn(prevRecord ? prevRecord.turn : PLAYER_COLORS.RED);
    } else {
      setBoard(lastRecord.board);
      setHistory(prev => prev.slice(0, -1));
      setCurrentTurn(lastRecord.turn);
    }

    setSelectedPiece(null);
    setValidMoves([]);
    setMultiJumpPiece(null);
    setLastMove(null);
    setMessage(`${lastRecord.turn === PLAYER_COLORS.RED ? "Red" : "Black"}'s Turn!`);
  }, [history, gameMode, humanColor]);

  const startGame = useCallback((mode, color, aiDifficulty) => {
    setGameMode(mode);
    setHumanColor(color);
    setComputerColor(color === PLAYER_COLORS.RED ? PLAYER_COLORS.BLACK : PLAYER_COLORS.RED);
    setDifficulty(aiDifficulty);
    setBoard(createInitialBoard());
    setCurrentTurn(PLAYER_COLORS.RED);
    setGameState(GAME_STATES.PLAYING);
    setSelectedPiece(null);
    setValidMoves([]);
    setHistory([]);
    setLastMove(null);
    setMultiJumpPiece(null);
    setWinner(null);
    setMessage("Red's Turn!");
  }, []);

  const resetGame = useCallback(() => {
    setGameState(GAME_STATES.SETUP);
    setBoard(createInitialBoard());
    setCurrentTurn(PLAYER_COLORS.RED);
    setSelectedPiece(null);
    setValidMoves([]);
    setHistory([]);
    setLastMove(null);
    setMultiJumpPiece(null);
    setWinner(null);
    setMessage('');
  }, []);

  const toggleHints = useCallback(() => {
    setShowHints(prev => !prev);
  }, []);

  const getHintMove = useCallback(() => {
    if (gameMode === GAME_MODES.HUMAN_VS_COMPUTER && currentTurn === humanColor) {
      const hint = getHint(board, humanColor);
      setCurrentHint(hint);
      setTimeout(() => setCurrentHint(null), 3000);
    } else if (gameMode === GAME_MODES.HUMAN_VS_HUMAN) {
      const hint = getHint(board, currentTurn);
      setCurrentHint(hint);
      setTimeout(() => setCurrentHint(null), 3000);
    }
  }, [board, currentTurn, gameMode, humanColor]);

  useEffect(() => {
    if (
      gameState === GAME_STATES.PLAYING &&
      gameMode === GAME_MODES.HUMAN_VS_COMPUTER &&
      currentTurn === computerColor &&
      !multiJumpPiece
    ) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, computerColor, difficulty);

        if (aiMove) {
          const result = executeMove(
            aiMove.from.row,
            aiMove.from.col,
            aiMove.to.row,
            aiMove.to.col
          );

          if (result.continueCapture) {
            const continueAICapture = () => {
              const nextAIMove = getAIMove(result.newBoard, computerColor, difficulty);
              if (nextAIMove && nextAIMove.isCapture) {
                setTimeout(() => {
                  executeMove(
                    nextAIMove.from.row,
                    nextAIMove.from.col,
                    nextAIMove.to.row,
                    nextAIMove.to.col
                  );
                }, 800);
              }
            };

            setTimeout(continueAICapture, 800);
          }
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [gameState, gameMode, currentTurn, computerColor, board, executeMove, multiJumpPiece, difficulty]);

  return {
    gameState,
    board,
    currentTurn,
    selectedPiece,
    validMoves,
    gameMode,
    humanColor,
    computerColor,
    winner,
    message,
    lastMove,
    multiJumpPiece,
    canUndo: history.length > 0,
    showHints,
    currentHint,
    difficulty,
    selectPiece,
    movePiece,
    undoMove,
    startGame,
    resetGame,
    toggleHints,
    getHintMove
  };
};
