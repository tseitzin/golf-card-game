import { Car } from '../../../types/race';

interface RaceHUDProps {
	cars: Car[];
	targetLaps: number;
}

const POSITION_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const POSITION_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export function RaceHUD({ cars, targetLaps }: RaceHUDProps) {
	const sortedCars = [...cars].sort((a, b) => {
		if (a.finished && b.finished) {
			return (a.finishPosition || 0) - (b.finishPosition || 0);
		}
		if (a.finished) return -1;
		if (b.finished) return 1;

		if (b.lapsCompleted !== a.lapsCompleted) {
			return b.lapsCompleted - a.lapsCompleted;
		}
		return b.trackProgress - a.trackProgress;
	});

	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 rounded-lg px-3 py-1.5 backdrop-blur-sm">
			<div className="flex gap-2 flex-wrap justify-center max-w-5xl">
				{sortedCars.map((car, index) => (
					<div
						key={car.id}
						className="flex items-center gap-1.5 px-2 py-0.5 rounded"
						style={{ backgroundColor: `${car.color}40` }}
					>
						<span
							className="text-xs font-bold px-1.5 py-0.5 rounded text-[10px]"
							style={{
								backgroundColor: POSITION_COLORS[index] || '#666',
								color: index < 3 ? '#000' : '#fff',
							}}
						>
							{index + 1}
						</span>
						<div
							className="w-3 h-3 rounded-full border border-white"
							style={{ backgroundColor: car.color }}
						/>
						<span className="text-white font-bold text-xs">
							#{car.number}
						</span>
						<span className="text-white/80 text-[10px]">
							{car.finished ? 'Done' : `${Math.min(car.lapsCompleted + 1, targetLaps)}/${targetLaps}`}
						</span>
						{!car.isAI && (
							<span className="text-[10px] bg-blue-500 text-white px-1 py-0.5 rounded">
								P{(car.playerIndex ?? 0) + 1}
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
