import React, { useState } from 'react';
import { Plane, Settings } from 'lucide-react';
import type { GameConfig, Difficulty } from '../types';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [planeCount, setPlaneCount] = useState<10 | 15 | 20>(10);
  const [duration, setDuration] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleStart = () => {
    onStartGame({ planeCount, duration, difficulty });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plane className="w-16 h-16 text-cyan-400" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-2">Battle Planes</h1>
          <p className="text-xl text-cyan-300">Defend the skies with lightning power</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Game Settings</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-cyan-300 mb-4">
                Number of Planes
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPlaneCount(count as 10 | 15 | 20)}
                    className={`py-4 px-6 rounded-xl font-bold text-xl transition-all ${
                      planeCount === count
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-cyan-300 mb-4">
                Game Duration: {duration} {duration === 1 ? 'minute' : 'minutes'}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>1 min</span>
                <span>6 min</span>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-cyan-300 mb-4">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-4 px-6 rounded-xl font-bold text-lg capitalize transition-all ${
                      difficulty === level
                        ? level === 'easy'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                          : level === 'medium'
                          ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50 scale-105'
                          : 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full mt-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]"
          >
            Start Battle
          </button>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Use your lightning weapon to shoot down enemy fighter jets!</p>
          <p className="mt-1">Click or press SPACE to fire</p>
        </div>
      </div>
    </div>
  );
}
