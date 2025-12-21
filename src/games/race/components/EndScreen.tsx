
import { useEffect, useRef } from 'react';
import { Trophy, Medal, RotateCcw } from 'lucide-react';
import { Car } from '../../../types/race';
import { drawCarPreview } from '../game/Car';

interface EndScreenProps {
	cars: Car[];
	onRaceAgain: () => void;
}

const POSITION_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const POSITION_LABELS = ['1st Place', '2nd Place', '3rd Place'];

export function EndScreen({ cars, onRaceAgain }: EndScreenProps) {
	const winnerCanvasRef = useRef<HTMLCanvasElement>(null);

	const sortedCars = [...cars].sort((a, b) => {
		if (a.finishPosition && b.finishPosition) {
			return a.finishPosition - b.finishPosition;
		}
		if (a.finished && !b.finished) return -1;
		if (!a.finished && b.finished) return 1;
		return b.lapsCompleted - a.lapsCompleted;
	});

	const winner = sortedCars[0];

	useEffect(() => {
		const canvas = winnerCanvasRef.current;
		if (!canvas || !winner) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawCarPreview(ctx, winner.color, winner.number, canvas.width / 2, canvas.height / 2, 2.5);
	}, [winner]);

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
			<Confetti />
			<div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

				<div className="relative z-10">
					<div className="text-center mb-6">
						<Trophy className="w-16 h-16 text-yellow-200 mx-auto mb-2 drop-shadow-lg" />
						<h1 className="text-4xl font-black text-white drop-shadow-lg">
							Race Complete!
						</h1>
					</div>

					<div className="bg-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
						<div className="text-center mb-3">
							<span className="text-lg font-bold text-white/80">Winner</span>
						</div>
						<div className="flex items-center justify-center gap-4">
							<canvas
								ref={winnerCanvasRef}
								width={120}
								height={100}
								className="bg-white/20 rounded-xl"
							/>
							<div className="text-center">
								<div
									className="text-6xl font-black drop-shadow-lg"
									style={{ color: winner?.color }}
								>
									#{winner?.number}
								</div>
								{!winner?.isAI && (
									<span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
										Player {(winner?.playerIndex ?? 0) + 1}
									</span>
								)}
								{winner?.isAI && (
									<span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
										AI Racer
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="bg-white/10 rounded-2xl p-4 mb-6">
						<h2 className="text-lg font-bold text-white mb-3 text-center">
							Final Standings
						</h2>
						<div className="space-y-2">
							{sortedCars.map((car, index) => (
								<div
									key={car.id}
									className="flex items-center gap-3 bg-white/20 rounded-xl px-4 py-2"
								>
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
										style={{
											backgroundColor: POSITION_COLORS[index] || '#666',
											color: index < 3 ? '#000' : '#fff',
										}}
									>
										{index < 3 ? <Medal className="w-5 h-5" /> : index + 1}
									</div>
									<div
										className="w-6 h-6 rounded-full border-2 border-white"
										style={{ backgroundColor: car.color }}
									/>
									<span className="text-white font-bold flex-1">
										#{car.number}
									</span>
									<span className="text-white/80 text-sm">
										{POSITION_LABELS[index] || `${index + 1}th Place`}
									</span>
									{!car.isAI && (
										<span className="bg-blue-500/50 text-white text-xs px-2 py-0.5 rounded">
											P{(car.playerIndex ?? 0) + 1}
										</span>
									)}
								</div>
							))}
						</div>
					</div>

					<button
						onClick={onRaceAgain}
						className="w-full py-4 bg-white text-orange-500 font-black text-xl rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
					>
						<RotateCcw className="w-6 h-6" />
						Race Again
					</button>
				</div>
			</div>
		</div>
	);
}

function Confetti() {
	return (
		<div className="absolute inset-0 pointer-events-none overflow-hidden">
			{Array.from({ length: 50 }).map((_, i) => (
				<div
					key={i}
					className="absolute w-3 h-3 animate-confetti"
					style={{
						left: `${Math.random() * 100}%`,
						top: `-20px`,
						backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][
							Math.floor(Math.random() * 8)
						],
						animationDelay: `${Math.random() * 3}s`,
						animationDuration: `${2 + Math.random() * 2}s`,
						transform: `rotate(${Math.random() * 360}deg)`,
					}}
				/>
			))}
			<style>{`
				@keyframes confetti {
					0% {
						transform: translateY(0) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(720deg);
						opacity: 0;
					}
				}
				.animate-confetti {
					animation: confetti linear infinite;
				}
			`}</style>
		</div>
	);
}
