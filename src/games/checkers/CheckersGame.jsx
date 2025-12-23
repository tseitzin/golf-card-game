import { motion } from 'framer-motion';
import { Undo, Home, Lightbulb, HelpCircle } from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import { GAME_STATES } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import EndScreen from './components/EndScreen';

const CheckersGame = () => {
  const {
    gameState,
    board,
    currentTurn,
    selectedPiece,
    validMoves,
    winner,
    message,
    lastMove,
    canUndo,
    showHints,
    currentHint,
    selectPiece,
    movePiece,
    undoMove,
    startGame,
    resetGame,
    toggleHints,
    getHintMove
  } = useGameState();

  const handleSquareClick = (row, col) => {
    const piece = board[row][col];

    if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
      movePiece(row, col);
    } else if (piece && piece.color === currentTurn) {
      selectPiece(row, col);
    }
  };

  if (gameState === GAME_STATES.SETUP) {
    return <SetupScreen onStartGame={startGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          <div className="w-full lg:w-auto">
            <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition-colors"
                >
                  <Home size={20} />
                  Menu
                </motion.button>

                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      currentTurn === 'red' ? 'text-red-500' : 'text-gray-700'
                    }`}
                  >
                    {currentTurn === 'red' ? 'Red' : 'Black'}'s Turn
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={undoMove}
                  disabled={!canUndo}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    canUndo
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Undo size={20} />
                  Undo
                </motion.button>
              </div>

              {message && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg font-semibold"
                >
                  {message}
                </motion.div>
              )}
            </div>

            <GameBoard
              board={board}
              selectedPiece={selectedPiece}
              validMoves={validMoves}
              onSquareClick={handleSquareClick}
              lastMove={lastMove}
              currentHint={currentHint}
            />
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Parent/Teacher Mode</h3>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleHints}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  showHints
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Lightbulb size={20} />
                {showHints ? 'Hints Enabled' : 'Enable Hints'}
              </motion.button>

              {showHints && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={getHintMove}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  <HelpCircle size={20} />
                  Show Hint
                </motion.button>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Game Rules:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Pieces move diagonally forward on dark squares</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>You must capture when possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">•</span>
                    <span>Multiple jumps in one turn are allowed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Reach the opposite end to become a King</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Kings can move forward and backward</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Legend:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 opacity-60"></div>
                    <span className="text-gray-600">Valid move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 opacity-60"></div>
                    <span className="text-gray-600">Must capture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-yellow-400"></div>
                    <span className="text-gray-600">Selected/Last move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-400"></div>
                    <span className="text-gray-600">Hint</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameState === GAME_STATES.ENDED && (
        <EndScreen
          winner={winner}
          onPlayAgain={resetGame}
          onBackToMenu={resetGame}
        />
      )}
    </div>
  );
};

export default CheckersGame;
