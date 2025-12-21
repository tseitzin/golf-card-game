import { useEffect, useRef } from 'react';
import { PlayerConfig } from '../../../types/race';
import { CAR_COLORS, KEYBOARD_CONTROLS } from '../../../constants/race/index.ts';
import { drawCarPreview } from '../game/Car';

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
				<canvas
					ref={canvasRef}
					width={60}
					height={60}
					className="bg-gray-50 rounded-lg border border-gray-200"
				/>
				<div className="flex flex-col gap-2 flex-1">
					<div>
						<label className="block text-xs font-bold text-gray-600 mb-1">Color</label>
						<div className="flex gap-1 flex-wrap">
							{CAR_COLORS.map(c => (
								<button
									key={c.value}
									onClick={() => handleColorChange(c.value)}
									disabled={isColorUsed(c.value)}
									className={`w-7 h-7 rounded-full border-2 transition-all ${
										config.color === c.value
											? 'border-blue-500 scale-110'
											: 'border-gray-300'
									} ${isColorUsed(c.value) ? 'opacity-40 cursor-not-allowed' : ''}`}
									style={{ backgroundColor: c.value }}
									title={c.name}
								/>
							))}
						</div>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-600 mb-1">Number</label>
						<input
							type="number"
							min={1}
							max={99}
							value={config.number}
							onChange={handleNumberChange}
							className={`w-16 px-2 py-1 rounded border-2 text-center font-bold text-lg ${
								isNumberUsed ? 'border-red-500 bg-red-50' : 'border-gray-300'
							}`}
						/>
						{isNumberUsed && (
							<span className="text-xs text-red-500 ml-2">In use</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
