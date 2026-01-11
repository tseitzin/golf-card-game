import { useState, useEffect } from 'react';
import { Fish as FishIcon, Users, Clock, Zap, Bot, Trash2 } from 'lucide-react';
import type { GameConfig, GameDuration, Difficulty } from '../types';
import { getLeaderboard, clearLeaderboard, type LeaderboardEntry } from '../utils/leaderboard';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [numRobots, setNumRobots] = useState(1);
  const [humanPlayers, setHumanPlayers] = useState([true, false, false, false]);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'AI 1', 'AI 2', 'AI 3']);
  const [duration, setDuration] = useState<GameDuration>(120);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    setLoading(true);
    const data = getLeaderboard(undefined, 10);
    setLeaderboard(data);
    setLoading(false);
  };

  const handleClearLeaderboard = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear the entire leaderboard? This cannot be undone.'
    );

    if (confirmed) {
      const success = clearLeaderboard();
      if (success) {
        loadLeaderboard();
      } else {
        alert('Failed to clear leaderboard. Please try again.');
      }
    }
  };

  const handleNumPlayersChange = (num: number) => {
    setNumPlayers(num);
    const newHumanPlayers = [...humanPlayers];
    const newPlayerNames = [...playerNames];

    for (let i = 0; i < 4; i++) {
      if (i < num) {
        if (i === 0) {
          newHumanPlayers[i] = true;
          newPlayerNames[i] = `Player ${i + 1}`;
        } else {
          if (newPlayerNames[i].startsWith('AI')) {
            newPlayerNames[i] = `AI ${i}`;
          }
        }
      }
    }

    setHumanPlayers(newHumanPlayers);
    setPlayerNames(newPlayerNames);
  };

  const togglePlayerType = (index: number) => {
    const newHumanPlayers = [...humanPlayers];
    newHumanPlayers[index] = !newHumanPlayers[index];

    const humanCount = newHumanPlayers.slice(0, numPlayers).filter(h => h).length;
    if (humanCount === 0) return;

    const newPlayerNames = [...playerNames];
    if (newHumanPlayers[index]) {
      const humanIndex = newHumanPlayers.slice(0, index + 1).filter(h => h).length;
      newPlayerNames[index] = `Player ${humanIndex}`;
    } else {
      const aiIndex = newHumanPlayers.slice(0, index + 1).filter(h => !h).length;
      newPlayerNames[index] = `AI ${aiIndex}`;
    }

    setHumanPlayers(newHumanPlayers);
    setPlayerNames(newPlayerNames);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleStartGame = () => {
    const activeHumanPlayers = humanPlayers.slice(0, numPlayers);
    const activePlayerNames = playerNames.slice(0, numPlayers);

    const humanCount = activeHumanPlayers.filter(h => h).length;
    if (humanCount === 0) {
      alert('At least one player must be human!');
      return;
    }

    for (let i = 0; i < numPlayers; i++) {
      if (activePlayerNames[i].trim() === '') {
        alert('All players must have a name!');
        return;
      }
    }

    onStartGame({
      numPlayers,
      numRobots,
      humanPlayers: activeHumanPlayers,
      playerNames: activePlayerNames,
      duration,
      difficulty,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FishIcon className="w-12 h-12 text-cyan-300" />
            <h1 className="text-5xl font-bold text-white">Archer Fish Racing</h1>
            <FishIcon className="w-12 h-12 text-cyan-300 scale-x-[-1]" />
          </div>
          <p className="text-xl text-blue-100">Escape the Evil Robot!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <Users className="w-5 h-5" />
                Number of Fish
              </label>
              <div className="flex gap-3">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumPlayersChange(num)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      numPlayers === num
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} Fish
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <Bot className="w-5 h-5" />
                Number of Robots
              </label>
              <div className="flex gap-3">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumRobots(num)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      numRobots === num
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} Robot{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold text-gray-700 mb-3 block">
                Player Configuration
              </label>
              <div className="space-y-3">
                {Array.from({ length: numPlayers }).map((_, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <button
                      onClick={() => togglePlayerType(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        humanPlayers[index]
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {humanPlayers[index] ? 'Human' : 'AI'}
                    </button>
                    <input
                      type="text"
                      value={playerNames[index]}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder={`${humanPlayers[index] ? 'Player' : 'AI'} ${index + 1} name`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <Clock className="w-5 h-5" />
                Game Duration
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[60, 120, 180, 240, 300].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setDuration(dur as GameDuration)}
                    className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                      duration === dur
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dur / 60}min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <Zap className="w-5 h-5" />
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all capitalize ${
                      difficulty === diff
                        ? diff === 'easy'
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : diff === 'medium'
                          ? 'bg-yellow-500 text-white shadow-lg scale-105'
                          : 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {difficulty === 'easy' && 'Perfect for kids - slow robots'}
                {difficulty === 'medium' && 'Balanced challenge - moderate robots'}
                {difficulty === 'hard' && 'Expert mode - fast & smart robots'}
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Game!
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Top Survivors</h2>
              <button
                onClick={handleClearLeaderboard}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear leaderboard"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">All Difficulties</p>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-gray-500">No scores yet. Be the first!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-100 border-2 border-yellow-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">#{index + 1}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {entry.player_name}
                          </span>
                          <span className={`text-xs font-medium capitalize ${
                            entry.difficulty === 'easy' ? 'text-green-600' :
                            entry.difficulty === 'medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {entry.difficulty}
                          </span>
                        </div>
                      </div>
                      <span className="text-blue-600 font-semibold">
                        {formatTime(entry.survival_time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
