import { useState, useEffect, useRef, useCallback } from 'react';
import { Pause, Play } from 'lucide-react';
import type { GameConfig, GameState, Fish, WaterJet, Robot, Obstacle } from '../types';
import { initializeFish, initializeRobots, initializeObstacles } from '../utils/gameInitializer';
import { checkCollision, keepInBounds, resolveObstacleCollision, resolveRobotCollisions } from '../utils/physics';
import { updateAIFish, updateRobot } from '../utils/ai';
import FishComponent from './FishComponent';
import RobotComponent from './RobotComponent';
import ObstacleComponent from './ObstacleComponent';
import WaterJetComponent from './WaterJetComponent';

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
    waterJets: [],
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

      // Handle water jet shooting
      let newWaterJets = [...prevState.waterJets];
      updatedFish.forEach(fish => {
        if (fish.isHuman && fish.controlKeys && !fish.isFrozen) {
          const canShoot = currentTime - fish.lastWaterJetTime >= fish.waterJetCooldown;
          if (keysPressed.current.has(fish.controlKeys.shoot) && canShoot) {
            // Determine shoot direction from fish velocity
            let shootVelX = fish.velocity.x;
            let shootVelY = fish.velocity.y;
            const speed = Math.sqrt(shootVelX * shootVelX + shootVelY * shootVelY);
            
            // If fish is nearly stationary, shoot to the right
            if (speed < 0.5) {
              shootVelX = 8;
              shootVelY = 0;
            } else {
              // Shoot in direction fish is moving
              shootVelX = (shootVelX / speed) * 8;
              shootVelY = (shootVelY / speed) * 8;
            }

            const newWaterJet: WaterJet = {
              id: `${fish.id}-${currentTime}`,
              position: { x: fish.position.x, y: fish.position.y },
              velocity: { x: shootVelX, y: shootVelY },
              fishId: fish.id,
              createdAt: currentTime,
            };

            newWaterJets.push(newWaterJet);
            fish.lastWaterJetTime = currentTime;
          }
        }
      });

      // Update water jets
      newWaterJets = newWaterJets.filter(jet => {
        const age = currentTime - jet.createdAt;
        const inBounds = jet.position.x >= 0 && jet.position.x <= ARENA_WIDTH &&
                         jet.position.y >= 0 && jet.position.y <= ARENA_HEIGHT;
        return age < 1000 && inBounds; // Remove after 1 second or out of bounds
      });

      newWaterJets = newWaterJets.map(jet => ({
        ...jet,
        position: {
          x: jet.position.x + jet.velocity.x,
          y: jet.position.y + jet.velocity.y,
        },
      }));

      const updatedRobots = prevState.robots.map(robot => {
        // If stuck time has expired, release the robot with a push
        if (robot.isStuck && currentTime >= robot.stuckUntil) {
          const magnetObstacle = prevState.obstacles.find(obs => obs.id === robot.stuckToObstacleId);
          if (magnetObstacle) {
            // Push robot away from magnet center
            const magnetCenterX = magnetObstacle.position.x + magnetObstacle.width / 2;
            const magnetCenterY = magnetObstacle.position.y + magnetObstacle.height / 2;
            const dx = robot.position.x - magnetCenterX;
            const dy = robot.position.y - magnetCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
              const pushStrength = 120;
              const pushX = (dx / dist) * pushStrength;
              const pushY = (dy / dist) * pushStrength;
              
              return {
                ...robot,
                position: {
                  x: robot.position.x + pushX,
                  y: robot.position.y + pushY,
                },
                velocity: {
                  x: (dx / dist) * 3,
                  y: (dy / dist) * 3,
                },
                isStuck: false,
                stuckUntil: 0,
                stuckToObstacleId: null,
              };
            }
          }
          // Fallback if magnet not found
          return {
            ...robot,
            isStuck: false,
            stuckUntil: 0,
            stuckToObstacleId: null,
          };
        }

        // Check if robot is stuck to a magnet
        if (robot.isStuck && currentTime < robot.stuckUntil) {
          // Keep robot stuck to side of magnet
          const magnetObstacle = prevState.obstacles.find(obs => obs.id === robot.stuckToObstacleId);
          if (magnetObstacle) {
            // Position robot on the side of the magnet (left side by default)
            // Add slight offset based on robot id so multiple robots don't overlap
            const offsetY = (robot.id % 3 - 1) * 25; // Spread robots vertically
            return {
              ...robot,
              position: {
                x: magnetObstacle.position.x - 20, // Left side of magnet
                y: magnetObstacle.position.y + magnetObstacle.height / 2 + offsetY,
              },
              velocity: { x: 0, y: 0 },
            };
          }
        }

        // Not stuck or being released - continue with normal robot logic
        let isStuck = robot.isStuck;
        let stuckUntil = robot.stuckUntil;
        let stuckToObstacleId = robot.stuckToObstacleId;

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

        // Check for magnet collision (only if not already stuck)
        if (!isStuck) {
          const magnetObstacles = prevState.obstacles.filter(obs => obs.type === 'magnet');
          for (const magnet of magnetObstacles) {
            const dx = boundedRobotPosition.x - (magnet.position.x + magnet.width / 2);
            const dy = boundedRobotPosition.y - (magnet.position.y + magnet.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if robot is within magnet's attraction range (100px)
            if (distance < 100) {
              isStuck = true;
              stuckUntil = currentTime + 10000; // Stick for 10 seconds
              stuckToObstacleId = magnet.id;
              break;
            }
          }
        }

        return {
          ...robot,
          position: boundedRobotPosition,
          velocity: resolved.velocity,
          targetFishId: robotUpdate.targetFishId,
          isStuck,
          stuckUntil,
          stuckToObstacleId,
        };
      });

      // Resolve robot-to-robot collisions
      const robotsAfterCollisions = resolveRobotCollisions(updatedRobots, 30);
      robotsAfterCollisions.forEach((resolvedRobot, index) => {
        updatedRobots[index] = resolvedRobot;
      });

      updatedFish.forEach(fish => {
        if (!fish.isFrozen) {
          for (const robot of updatedRobots) {
            // Skip robots that are stuck to magnets - they can't freeze fish
            if (robot.isStuck) {
              continue;
            }
            
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

      // Handle water jet collisions with robots
      const jetsToRemove = new Set<string>();
      newWaterJets.forEach(jet => {
        updatedRobots.forEach(robot => {
          if (checkCollision(jet.position, robot.position, 30)) {
            // Push robot away from water jet
            const dx = robot.position.x - jet.position.x;
            const dy = robot.position.y - jet.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
              const pushStrength = 150;
              const pushX = (dx / dist) * pushStrength;
              const pushY = (dy / dist) * pushStrength;
              
              robot.position = {
                x: robot.position.x + pushX,
                y: robot.position.y + pushY,
              };
              
              // Keep robot in bounds
              robot.position = keepInBounds(
                robot.position,
                robot.velocity,
                ARENA_WIDTH,
                ARENA_HEIGHT
              );
            }
            
            jetsToRemove.add(jet.id);
          }
        });
      });

      // Remove water jets that hit robots
      newWaterJets = newWaterJets.filter(jet => !jetsToRemove.has(jet.id));

      return {
        ...prevState,
        fish: updatedFish,
        robots: updatedRobots,
        waterJets: newWaterJets,
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
    let mins = Math.floor(seconds / 60);
    let secs = parseFloat((seconds % 60).toFixed(1));
    
    // Handle rounding edge case where seconds rounds to 60
    if (secs >= 60) {
      mins += 1;
      secs = 0;
    }
    
    return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <div className="bg-white rounded-t-2xl p-4 shadow-lg flex justify-between items-center">
          <div className="flex gap-6">
            {[...gameState.fish].sort((a, b) => b.survivalTime - a.survivalTime).map(fish => (
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

          {gameState.waterJets.map(waterJet => (
            <WaterJetComponent key={waterJet.id} waterJet={waterJet} />
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
                Player 1: Arrow Keys + Space (boost) + S (shoot)
                {config.humanPlayers[1] && ' | Player 2: WASD + Shift (boost) + S (shoot)'}
                {config.humanPlayers[2] && ' | Player 3: IJKL + Enter (boost) + S (shoot)'}
                {config.humanPlayers[3] && ' | Player 4: TFGH + Q (boost) + S (shoot)'}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
