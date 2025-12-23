import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Cpu, Crown, Play } from 'lucide-react';
import { GAME_MODES, PLAYER_COLORS, AI_DIFFICULTY } from '../constants';

const SetupScreen = ({ onStartGame }) => {
  const [gameMode, setGameMode] = useState(GAME_MODES.HUMAN_VS_COMPUTER);
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS.RED);
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTY.MEDIUM);

  const handleStartGame = () => {
    onStartGame(gameMode, selectedColor, difficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block mb-4"
          >
            <Crown className="w-16 h-16 text-yellow-500" strokeWidth={2} />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkers</h1>
          <p className="text-gray-600">Choose your game settings</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameMode(GAME_MODES.HUMAN_VS_HUMAN)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  gameMode === GAME_MODES.HUMAN_VS_HUMAN
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium text-gray-700">
                  2 Players
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameMode(GAME_MODES.HUMAN_VS_COMPUTER)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  gameMode === GAME_MODES.HUMAN_VS_COMPUTER
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Cpu className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-sm font-medium text-gray-700">
                  vs Computer
                </div>
              </motion.button>
            </div>
          </div>

          {gameMode === GAME_MODES.HUMAN_VS_COMPUTER && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Your Color
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedColor(PLAYER_COLORS.RED)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedColor === PLAYER_COLORS.RED
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg" />
                  <div className="text-sm font-medium text-gray-700">Red</div>
                  <div className="text-xs text-gray-500">Goes First</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedColor(PLAYER_COLORS.BLACK)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedColor === PLAYER_COLORS.BLACK
                      ? 'border-gray-700 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg" />
                  <div className="text-sm font-medium text-gray-700">Black</div>
                  <div className="text-xs text-gray-500">Second</div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameMode === GAME_MODES.HUMAN_VS_COMPUTER && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficulty(AI_DIFFICULTY.EASY)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    difficulty === AI_DIFFICULTY.EASY
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">Easy</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficulty(AI_DIFFICULTY.MEDIUM)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    difficulty === AI_DIFFICULTY.MEDIUM
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">Medium</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficulty(AI_DIFFICULTY.HARD)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    difficulty === AI_DIFFICULTY.HARD
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">Hard</div>
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <Play size={24} />
            Start Game
          </motion.button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-sm text-gray-700 mb-2">How to Play:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Click or drag pieces to move</li>
            <li>• You must capture when possible</li>
            <li>• Reach the opposite end to become a King</li>
            <li>• Kings can move in all directions</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupScreen;
