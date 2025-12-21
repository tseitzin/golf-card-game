import { useEffect, useRef } from 'react';
import { PlayerConfig } from '../../types/race';
import { CAR_COLORS, KEYBOARD_CONTROLS } from '../../constants/race';
import { drawCarPreview } from '../../game/race/Car';

interface PlayerConfigPanelProps {
  playerIndex: number;
  config: PlayerConfig;
  usedColors: string[];
  usedNumbers: number[];
  onChange: (config: PlayerConfig) => void;
}

export function PlayerConfigPanel({
  playerIndex,
  config,
  usedColors,
  usedNumbers,
  onChange,
}: PlayerConfigPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = KEYBOARD_CONTROLS[playerIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCarPreview(ctx, config.color, config.number, canvas.width / 2, canvas.height / 2, 1.5);
  }, [config.color, config.number]);

  const handleColorChange = (color: string) => {
    onChange({ ...config, color });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const clamped = Math.min(99, Math.max(1, value));
    onChange({ ...config, number: clamped });
  };

  const isColorUsed = (color: string) => {
    return usedColors.includes(color) && color !== config.color;
  };

  const isNumberUsed = usedNumbers.includes(config.number) &&
    usedNumbers.filter(n => n === config.number).length > 1;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-800">Player {playerIndex + 1}</h3>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
          {controls?.label || 'N/A'}
        </span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Car Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CAR_COLORS.map(({ name, value }) => (
              <button
                key={value}
                className={`w-10 h-10 rounded-lg border-3 transition-all ${
                  config.color === value
                    ? 'ring-4 ring-blue-400 scale-110'
                    : isColorUsed(value)
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: value, borderColor: value === '#FAFAFA' ? '#ccc' : value }}
                onClick={() => !isColorUsed(value) && handleColorChange(value)}
                disabled={isColorUsed(value)}
                title={name}
              />
            ))}
          </div>

          <label className="block text-sm font-semibold text-gray-600 mb-2 mt-4">
            Car Number
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={config.number}
            onChange={handleNumberChange}
            className={`w-full px-3 py-2 text-xl font-bold text-center border-2 rounded-lg ${
              isNumberUsed
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {isNumberUsed && (
            <p className="text-red-500 text-xs mt-1">Number already taken!</p>
          )}
        </div>

        <div className="flex flex-col items-center">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Preview
          </label>
          <canvas
            ref={canvasRef}
            width={80}
            height={100}
            className="bg-gray-100 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
