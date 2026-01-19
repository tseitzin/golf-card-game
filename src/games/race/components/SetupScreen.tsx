import { useEffect, useRef } from 'react';
import { Flag, Users, Bot, RotateCcw } from 'lucide-react';
import { RaceConfig, PlayerConfig, TrackType } from '../../../types/race';
import { CAR_COLORS, GAME_CONFIG } from '../../../constants/race';
import { TRACK_DEFINITIONS, TRACK_ORDER } from '../../../constants/race/tracks';
import { PlayerConfigPanel } from './PlayerConfigPanel';
import { drawCarPreview } from '../game/Car';
import { generateAICars } from '../utils/aiCars';

interface SetupScreenProps {
  config: RaceConfig;
  onConfigChange: (config: RaceConfig) => void;
  onStartRace: () => void;
}

const LAP_OPTIONS = [3, 5, 10];

export function SetupScreen({ config, onConfigChange, onStartRace }: SetupScreenProps) {
  const aiCanvasRef = useRef<HTMLCanvasElement>(null);

  const usedColors = config.playerConfigs.map(p => p.color);
  const usedNumbers = config.playerConfigs.map(p => p.number);

  const getAvailableNumber = (exclude: number[]) => {
    for (let i = 1; i <= 99; i++) {
      if (!exclude.includes(i)) return i;
    }
    return 1;
  };

  const aiCars = generateAICars(config.aiRacers, usedColors, usedNumbers);

  useEffect(() => {
    const canvas = aiCanvasRef.current;
    if (!canvas || config.aiRacers === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    aiCars.forEach((car, index) => {
      const x = 50 + (index % 4) * 80;
      const y = 50 + Math.floor(index / 4) * 80;
      drawCarPreview(ctx, car.color, car.number, x, y, 1);
    });
  }, [config.aiRacers, aiCars]);

  const handleHumanPlayersChange = (count: number) => {
    const newConfigs: PlayerConfig[] = [];
    const availableColors = [...CAR_COLORS];
    const usedNums: number[] = [];

    for (let i = 0; i < count; i++) {
      if (config.playerConfigs[i]) {
        newConfigs.push(config.playerConfigs[i]);
        const colorIdx = availableColors.findIndex(c => c.value === config.playerConfigs[i].color);
        if (colorIdx !== -1) availableColors.splice(colorIdx, 1);
        usedNums.push(config.playerConfigs[i].number);
      } else {
        const color = availableColors.shift()?.value || CAR_COLORS[0].value;
        const number = getAvailableNumber(usedNums);
        usedNums.push(number);
        newConfigs.push({ color, number, style: 0 });
      }
    }

    const maxAI = GAME_CONFIG.maxTotalRacers - count;
    const newAICount = Math.min(config.aiRacers, maxAI);

    onConfigChange({
      ...config,
      humanPlayers: count,
      aiRacers: newAICount,
      playerConfigs: newConfigs,
    });
  };

  const handleAIRacersChange = (count: number) => {
    onConfigChange({ ...config, aiRacers: count });
  };

  const handleLapsChange = (laps: number) => {
    onConfigChange({ ...config, laps });
  };

  const handleTrackChange = (trackType: TrackType) => {
    onConfigChange({ ...config, trackType });
  };

  const handlePlayerConfigChange = (index: number, playerConfig: PlayerConfig) => {
    const newConfigs = [...config.playerConfigs];
    newConfigs[index] = playerConfig;
    onConfigChange({ ...config, playerConfigs: newConfigs });
  };

  const maxAIRacers = GAME_CONFIG.maxTotalRacers - config.humanPlayers;
  const totalRacers = config.humanPlayers + config.aiRacers;

  const hasValidConfig = () => {
    const colors = config.playerConfigs.map(p => p.color);
    const numbers = config.playerConfigs.map(p => p.number);
    const uniqueColors = new Set(colors);
    const uniqueNumbers = new Set(numbers);
    return uniqueColors.size === colors.length && uniqueNumbers.size === numbers.length && totalRacers >= 2;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#1A252F] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
            Race Setup
          </h1>
          <p className="text-white/80 text-lg">Configure your race and get ready to go!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-6 h-6 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-800">Select Track</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {TRACK_ORDER.map(trackType => {
                const track = TRACK_DEFINITIONS[trackType];
                return (
                  <button
                    key={trackType}
                    onClick={() => handleTrackChange(trackType)}
                    className={`p-3 rounded-xl transition-all text-center ${
                      config.trackType === trackType
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{track.emoji}</div>
                    <div className="text-xs font-semibold">{track.name}</div>
                    <div className="text-xs opacity-75">{track.difficulty}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">Human Players</h2>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => handleHumanPlayersChange(num)}
                  className={`flex-1 py-3 text-xl font-bold rounded-xl transition-all ${
                    config.humanPlayers === num
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-6 h-6 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800">AI Racers</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: maxAIRacers + 1 }).map((_, num) => (
                <button
                  key={num}
                  onClick={() => handleAIRacersChange(num)}
                  className={`w-10 h-10 text-lg font-bold rounded-xl transition-all ${
                    config.aiRacers === num
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-6 h-6 text-green-500" />
              <h2 className="text-lg font-bold text-gray-800">Laps</h2>
            </div>
            <div className="flex gap-2">
              {LAP_OPTIONS.map(laps => (
                <button
                  key={laps}
                  onClick={() => handleLapsChange(laps)}
                  className={`flex-1 py-3 text-xl font-bold rounded-xl transition-all ${
                    config.laps === laps
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {laps}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {Array.from({ length: config.humanPlayers }).map((_, index) => (
            <PlayerConfigPanel
              key={index}
              playerIndex={index}
              config={config.playerConfigs[index]}
              usedColors={usedColors}
              usedNumbers={usedNumbers}
              onChange={(newConfig) => handlePlayerConfigChange(index, newConfig)}
            />
          ))}
        </div>

        {config.aiRacers > 0 && (
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              AI Racers ({config.aiRacers})
            </h3>
            <canvas
              ref={aiCanvasRef}
              width={320}
              height={Math.ceil(config.aiRacers / 4) * 80 + 20}
              className="bg-gray-50 rounded-lg"
            />
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onStartRace}
            disabled={!hasValidConfig()}
            className={`px-12 py-4 text-2xl font-black rounded-2xl transition-all transform ${
              hasValidConfig()
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl hover:scale-105 hover:shadow-2xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8" />
              <span>Start Race!</span>
            </div>
          </button>
          {totalRacers < 2 && (
            <p className="text-white/80 mt-2">Need at least 2 racers to start!</p>
          )}
        </div>
      </div>
    </div>
  );
}
