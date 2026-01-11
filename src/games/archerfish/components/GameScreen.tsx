import { useState, useEffect, useRef, useCallback } from 'react';
import { Pause, Play } from 'lucide-react';
import type { GameConfig, GameState, Fish } from '../types';
import { initializeFish, initializeRobots, initializeObstacles } from '../utils/gameInitializer';
import { checkCollision, keepInBounds, resolveObstacleCollision } from '../utils/physics';
import { updateAIFish, updateRobot } from '../utils/ai';
import FishComponent from './FishComponent';
import RobotComponent from './RobotComponent';
import ObstacleComponent from './ObstacleComponent';

interface GameScreenProps {
  config: GameConfig;
  onGameEnd: (fish: Fish[]) => void;
}

const ARENA_WIDTH = 1200;
const ARENA_HEIGHT = 700;

export default function GameScreen({ config, onGameEnd }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    fish: initializeFish(config, ARENA_WIDTH, ARENA_HEIGHT),
    robots: initializeRobots(config.numRobots, config.difficulty, ARENA_WIDTH, ARENA_HEIGHT),
    obstacles: initializeObstacles(ARENA_WIDTH, ARENA_HEIGHT),
    gameTime: config.duration,
    isPlaying: true,
    isPaused: false,
    winner: null,
  }));

  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number>(Date.now());

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const gameLoop = useCallback(() => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    setGameState(prevState => {
      if (prevState.isPaused || !prevState.isPlaying) {
        return prevState;
      }

      const elapsedTime = (currentTime - gameStartTimeRef.current) / 1000;
      const remainingTime = Math.max(0, config.duration - elapsedTime);

      if (remainingTime === 0) {
        const winner = prevState.fish.reduce((best, current) =>
          current.survivalTime > best.survivalTime ? current : best
        );
        onGameEnd(prevState.fish);
        return { ...prevState, isPlaying: false, winner, gameTime: 0 };
      }

      const updatedFish = prevState.fish.map(fish => {
        let newVelX = fish.velocity.x;
        let newVelY = fish.velocity.y;
        let newSurvivalTime = fish.survivalTime;
        let newFrozenTime = fish.frozenTime;
        let newIsFrozen = fish.isFrozen;

        const timeToAdd = Math.min(deltaTime, remainingTime);

        if (fish.isFrozen) {
          if (currentTime >= fish.frozenUntil) {
            newIsFrozen = false;
            newSurvivalTime += timeToAdd;
          } else {
            newFrozenTime += timeToAdd;
            newVelX *= 0.9;
            newVelY *= 0.9;
          }
        } else {
          newSurvivalTime += timeToAdd;

          if (fish.isHuman && fish.controlKeys) {
            const acceleration = 0.3;
            const maxSpeed = 5;
            const boostMultiplier = keysPressed.current.has(fish.controlKeys.boost) ? 1.5 : 1;

            if (keysPressed.current.has(fish.controlKeys.up)) {
              newVelY -= acceleration * boostMultiplier;
            }
            if (keysPressed.current.has(fish.controlKeys.down)) {
              newVelY += acceleration * boostMultiplier;
            }
            if (keysPressed.current.has(fish.controlKeys.left)) {
              newVelX -= acceleration * boostMultiplier;
            }
            if (keysPressed.current.has(fish.controlKeys.right)) {
              newVelX += acceleration * boostMultiplier;
            }

            const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
            if (speed > maxSpeed * boostMultiplier) {
              newVelX = (newVelX / speed) * maxSpeed * boostMultiplier;
              newVelY = (newVelY / speed) * maxSpeed * boostMultiplier;
            }

            newVelX *= 0.98;
            newVelY *= 0.98;
          } else {
            const aiVelocity = updateAIFish(
              fish,
              prevState.robots,
              prevState.obstacles,
              ARENA_WIDTH,
              ARENA_HEIGHT,
              deltaTime
            );
            newVelX = aiVelocity.x;
            newVelY = aiVelocity.y;
          }
        }

        const resolved = resolveObstacleCollision(
          fish.position,
          { x: newVelX, y: newVelY },
          prevState.obstacles
        );

        const boundedPosition = keepInBounds(resolved.position, resolved.velocity, ARENA_WIDTH, ARENA_HEIGHT);

        return {
          ...fish,
          position: boundedPosition,
          velocity: resolved.velocity,
          survivalTime: newSurvivalTime,
          frozenTime: newFrozenTime,
          isFrozen: newIsFrozen,
        };
      });

      const updatedRobots = prevState.robots.map(robot => {
        const frozenFish = updatedFish.filter(f => f.isFrozen);
        let robotPosition = robot.position;

        for (const frozen of frozenFish) {
          const dx = robot.position.x - frozen.position.x;
          const dy = robot.position.y - frozen.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            let pushX = dx;
            let pushY = dy;

            if (Math.abs(pushX) < 5 && Math.abs(pushY) < 5) {
              const angle = (robot.id * 1.5 + Date.now() * 0.001) % (Math.PI * 2);
              pushX = Math.cos(angle);
              pushY = Math.sin(angle);
            }

            const length = Math.sqrt(pushX * pushX + pushY * pushY);
            if (length > 0) {
              pushX = (pushX / length) * 100;
              pushY = (pushY / length) * 100;
            }

            robotPosition = {
              x: robot.position.x + pushX,
              y: robot.position.y + pushY,
            };
            break;
          }
        }

        const robotUpdate = updateRobot(
          { ...robot, position: robotPosition },
          updatedFish,
          prevState.obstacles,
          config.difficulty,
          deltaTime
        );

        const resolved = resolveObstacleCollision(
          robotPosition,
          robotUpdate.velocity,
          prevState.obstacles,
          30
        );

        const boundedRobotPosition = keepInBounds(
          resolved.position,
          resolved.velocity,
          ARENA_WIDTH,
          ARENA_HEIGHT
        );

        return {
          ...robot,
          position: boundedRobotPosition,
          velocity: resolved.velocity,
          targetFishId: robotUpdate.targetFishId,
        };
      });

      updatedFish.forEach(fish => {
        if (!fish.isFrozen) {
          for (const robot of updatedRobots) {
            if (checkCollision(fish.position, robot.position, 35)) {
              fish.isFrozen = true;
              fish.frozenUntil = currentTime + 5000;
              if (robot.targetFishId === fish.id) {
                robot.targetFishId = null;
              }
              break;
            }
          }
        }
      });

      return {
        ...prevState,
        fish: updatedFish,
        robots: updatedRobots,
        gameTime: remainingTime,
      };
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [config, onGameEnd]);

  useEffect(() => {
    gameStartTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <div className="bg-white rounded-t-2xl p-4 shadow-lg flex justify-between items-center">
          <div className="flex gap-6">
            {gameState.fish.map(fish => (
              <div key={fish.id} className="text-sm">
                <span className="font-bold" style={{ color: fish.color }}>
                  {fish.name}:
                </span>
                <span className="ml-2 font-mono">{formatTime(fish.survivalTime)}</span>
                {fish.isFrozen && <span className="ml-2 text-blue-500">❄️ FROZEN</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              Time: {formatTime(gameState.gameTime)}
            </div>
            <button
              onClick={togglePause}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {gameState.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div
          className="relative bg-gradient-to-br from-cyan-300 via-blue-300 to-blue-400 shadow-2xl overflow-hidden"
          style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT, margin: '0 auto' }}
        >
          {gameState.obstacles.map(obstacle => (
            <ObstacleComponent key={obstacle.id} obstacle={obstacle} />
          ))}

          {gameState.fish.map(fish => (
            <FishComponent key={fish.id} fish={fish} />
          ))}

          {gameState.robots.map(robot => (
            <RobotComponent key={robot.id} robot={robot} />
          ))}

          {gameState.isPaused && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">PAUSED</h2>
                <p className="text-gray-600">Press the pause button to continue</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-b-2xl p-4 shadow-lg">
          <div className="text-sm text-gray-600 text-center">
            Controls: {config.humanPlayers.filter(h => h).length > 0 && (
              <>
                Player 1: Arrow Keys + Space
                {config.humanPlayers[1] && ' | Player 2: WASD + Shift'}
                {config.humanPlayers[2] && ' | Player 3: IJKL + Enter'}
                {config.humanPlayers[3] && ' | Player 4: TFGH + Q'}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
