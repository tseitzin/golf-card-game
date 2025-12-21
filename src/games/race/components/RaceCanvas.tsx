
import { useRef, useEffect, useCallback } from 'react';
import { Car, TrackDimensions, PlayerInputs } from '../../../types/race';
import { drawTrack, getPositionOnTrack, getRotationAtPosition, calculateTrackDimensions } from '../game/Track';
import { drawCar } from '../game/Car';
import { updateRaceState } from '../game/GameEngine';

interface RaceCanvasProps {
	cars: Car[];
	isRacing: boolean;
	targetLaps: number;
	playerInputs: PlayerInputs;
	onCarsUpdate: (cars: Car[]) => void;
	onRaceFinished: () => void;
}

export function RaceCanvas({
	cars,
	isRacing,
	targetLaps,
	playerInputs,
	onCarsUpdate,
	onRaceFinished,
}: RaceCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>();
	const lastTimeRef = useRef<number>(0);
	const dimensionsRef = useRef<TrackDimensions | null>(null);
	const carsRef = useRef<Car[]>(cars);
	const inputsRef = useRef<PlayerInputs>(playerInputs);

	carsRef.current = cars;
	inputsRef.current = playerInputs;

	const updateCanvasSize = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const rect = container.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;

		dimensionsRef.current = calculateTrackDimensions(
			canvas.width,
			canvas.height,
			cars.length
		);
	}, [cars.length]);

	useEffect(() => {
		updateCanvasSize();
		window.addEventListener('resize', updateCanvasSize);
		return () => window.removeEventListener('resize', updateCanvasSize);
	}, [updateCanvasSize]);

	const gameLoop = useCallback((timestamp: number) => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		const dimensions = dimensionsRef.current;

		if (!canvas || !ctx || !dimensions) {
			animationRef.current = requestAnimationFrame(gameLoop);
			return;
		}

		const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
		lastTimeRef.current = timestamp;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawTrack(ctx, dimensions);

		let currentCars = carsRef.current;

		if (isRacing) {
			const { cars: updatedCars, finished } = updateRaceState(
				currentCars,
				deltaTime,
				inputsRef.current,
				targetLaps
			);
			currentCars = updatedCars;
			onCarsUpdate(updatedCars);

			if (finished) {
				onRaceFinished();
			}
		}

		currentCars.forEach(car => {
			const position = getPositionOnTrack(car.trackProgress, car.lane, dimensions, car.laneOffset);
			const rotation = getRotationAtPosition(car.trackProgress) + car.steeringAngle;
			drawCar(ctx, car, position, rotation);
		});

		animationRef.current = requestAnimationFrame(gameLoop);
	}, [isRacing, targetLaps, onCarsUpdate, onRaceFinished]);

	useEffect(() => {
		animationRef.current = requestAnimationFrame(gameLoop);
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [gameLoop]);

	return (
		<div ref={containerRef} className="w-full h-full">
			<canvas
				ref={canvasRef}
				className="block w-full h-full"
			/>
		</div>
	);
}
