import { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, BarChart3 } from 'lucide-react';
import type { Fish, GameConfig } from '../types';
import { saveLeaderboardEntry } from '../utils/leaderboard';

interface GameResultsProps {
  fish: Fish[];
  config: GameConfig;
  onPlayAgain: () => void;
}

export default function GameResults({ fish, config, onPlayAgain }: GameResultsProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const hasSaved = useRef(false);

  const sortedFish = [...fish].sort((a, b) => b.survivalTime - a.survivalTime);
  const winner = sortedFish[0];
  const winningTime = winner.survivalTime;

  useEffect(() => {
    if (!hasSaved.current) {
      saveResults();
      hasSaved.current = true;
    }
  }, []);

  const saveResults = () => {
    setSaving(true);

    try {
      // Only save winner(s) - fish with the highest survival time
      const winners = sortedFish.filter(f => f.survivalTime === winningTime);
      
      for (const f of winners) {
        saveLeaderboardEntry({
          player_name: f.name,
          survival_time: Math.floor(f.survivalTime),
          difficulty: config.difficulty,
          is_human: f.isHuman,
        });
      }

      setSaved(true);
    } catch (error) {
      console.error('Error saving results:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h1>
            <div className="text-2xl font-semibold" style={{ color: winner.color }}>
              {winner.name} Wins!
            </div>
            <p className="text-gray-600 mt-2">
              Survived for {formatTime(winner.survivalTime)}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Final Scores
            </h2>
            <div className="space-y-3">
              {sortedFish.map((f, index) => (
                <div
                  key={f.id}
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMedalEmoji(index)}</span>
                    <div>
                      <div className="font-bold text-gray-800" style={{ color: f.color }}>
                        {f.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {f.isHuman ? 'Human' : 'AI'} Player
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      {formatTime(f.survivalTime)}
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>Game: {formatTime(config.duration)}</div>
                      <div>Active: {formatTime(f.survivalTime)}</div>
                      <div>Frozen: {formatTime(f.frozenTime)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {saving && (
              <div className="text-center text-gray-600 py-2">
                Saving results to leaderboard...
              </div>
            )}
            {saved && (
              <div className="text-center text-green-600 font-semibold py-2">
                Results saved to leaderboard!
              </div>
            )}
            <button
              onClick={onPlayAgain}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Play Again
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Game Settings</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Difficulty: <span className="font-medium capitalize">{config.difficulty}</span></div>
              <div>Duration: <span className="font-medium">{config.duration / 60} minutes</span></div>
              <div>Players: <span className="font-medium">{config.numPlayers}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
