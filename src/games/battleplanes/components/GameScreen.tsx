import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Home } from 'lucide-react';
import type { GameConfig, Plane as PlaneType, GameState } from '../types';
import Plane from './Plane';
import Weapon from './Weapon';
import Explosion from './Explosion';

interface ExplosionData {
  id: string;
  x: number;
  y: number;
}

interface GameScreenProps {
  config: GameConfig;
  onExit: () => void;
}

export default function GameScreen({ config, onExit }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>({
    planes: [],
    score: 0,
    timeRemaining: config.duration * 60,
    isPlaying: true,
    weaponRecharging: false,
    lightningActive: false,
  });

  const [rechargeProgress, setRechargeProgress] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [explosions, setExplosions] = useState<ExplosionData[]>([]);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const weaponXRef = useRef(0);
  const rechargeStartRef = useRef(0);
  const hasSeenPlanesRef = useRef(false);
  const gameStartTimeRef = useRef(Date.now());

  const difficultyMultipliers = {
    easy: { speed: 0.7, size: 1.2 },
    medium: { speed: 1.0, size: 1.0 },
    hard: { speed: 1.5, size: 0.75 },
  };

  const multiplier = difficultyMultipliers[config.difficulty];

  const getPlaneVarietiesCount = () => {
    if (config.planeCount === 10) return 2;
    if (config.planeCount === 15) return 3;
    return 4;
  };

  const initializePlanes = useCallback(() => {
    const planes: PlaneType[] = [];
    const varietiesCount = getPlaneVarietiesCount();
    const baseWidth = 120 * multiplier.size;
    const baseHeight = 48 * multiplier.size;
    const baseSpeed = 2 * multiplier.speed;

    for (let i = 0; i < config.planeCount; i++) {
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const variety = (i % varietiesCount) + 1;
      const yPosition = 50 + (i * 30) % 400;

      planes.push({
        id: `plane-${i}`,
        number: i + 1,
        x: direction === 'right' ? -100 : window.innerWidth + 100,
        y: yPosition,
        direction,
        speed: baseSpeed + Math.random() * baseSpeed * 0.5,
        variety,
        width: baseWidth,
        height: baseHeight,
      });
    }

    return planes;
  }, [config.planeCount, config.difficulty, multiplier.size, multiplier.speed]);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, planes: initializePlanes() }));
  }, [initializePlanes]);

  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          setGameOver(true);
          return { ...prev, timeRemaining: 0, isPlaying: false };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  useEffect(() => {
    if (gameState.planes.length > 0) {
      hasSeenPlanesRef.current = true;
    }

    if (hasSeenPlanesRef.current && gameState.planes.length === 0 && gameState.isPlaying) {
      setTimeout(() => {
        setGameOver(true);
        setGameState((prev) => ({ ...prev, isPlaying: false }));
      }, 1500);
    }
  }, [gameState.planes.length, gameState.isPlaying]);

  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = setInterval(() => {
      setGameState((prev) => {
        const updatedPlanes = prev.planes.map((plane) => {
          let newX = plane.x;

          if (plane.direction === 'right') {
            newX += plane.speed;
            if (newX > window.innerWidth + 100) {
              newX = -100;
            }
          } else {
            newX -= plane.speed;
            if (newX < -100) {
              newX = window.innerWidth + 100;
            }
          }

          return { ...plane, x: newX };
        });

        return { ...prev, planes: updatedPlanes };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying]);

  useEffect(() => {
    if (gameState.weaponRecharging) {
      rechargeStartRef.current = Date.now();

      const rechargeInterval = setInterval(() => {
        const elapsed = Date.now() - rechargeStartRef.current;
        const progress = Math.min((elapsed / 3000) * 100, 100);
        setRechargeProgress(progress);

        if (progress >= 100) {
          setGameState((prev) => ({ ...prev, weaponRecharging: false }));
          setRechargeProgress(100);
          clearInterval(rechargeInterval);
        }
      }, 50);

      return () => clearInterval(rechargeInterval);
    }
  }, [gameState.weaponRecharging]);

  useEffect(() => {
    if (gameState.lightningActive) {
      const timeout = setTimeout(() => {
        setGameState((prev) => ({ ...prev, lightningActive: false }));
      }, 150);

      return () => clearTimeout(timeout);
    }
  }, [gameState.lightningActive]);

  const checkCollision = useCallback(() => {
    if (!gameContainerRef.current) return;

    const containerRect = gameContainerRef.current.getBoundingClientRect();
    const bottomOffset = 160;
    const lightningHeight = Math.max(containerRect.height - bottomOffset, 600);
    const weaponCenterX = containerRect.width / 2 - 3;
    const collisionWidth = 22;
    const weaponLeft = weaponCenterX - collisionWidth / 2;
    const weaponRight = weaponCenterX + collisionWidth / 2;
    const lightningBottom = containerRect.height - bottomOffset;
    const rawLightningTop = lightningBottom - lightningHeight;
    const lightningTop = Math.max(0, rawLightningTop);

    setGameState((prev) => {
      let hitPlanes: PlaneType[] = [];

      prev.planes.forEach((plane) => {
        const planeLeft = plane.x;
        const planeRight = plane.x + plane.width;
        const planeTop = plane.y;
        const planeBottom = plane.y + plane.height;

        // Standard AABB collision: check if rectangles overlap
        const horizontalOverlap =
          planeRight > weaponLeft && planeLeft < weaponRight;

        const verticalOverlap =
          planeBottom > lightningTop && planeTop < lightningBottom;

        if (horizontalOverlap && verticalOverlap) {
          hitPlanes.push(plane);
        }
      });

      if (hitPlanes.length > 0) {
        const newExplosions: ExplosionData[] = hitPlanes.map((plane) => ({
          id: `explosion-${plane.id}-${Date.now()}`,
          x: plane.x + plane.width / 2,
          y: plane.y + plane.height / 2,
        }));

        setExplosions((prev) => [...prev, ...newExplosions]);

        const hitPlaneIds = hitPlanes.map((p) => p.id);
        const newPlanes = prev.planes.filter((p) => !hitPlaneIds.includes(p.id));
        return {
          ...prev,
          planes: newPlanes,
          score: prev.score + hitPlanes.length,
        };
      }

      return prev;
    });
  }, []);

  const removeExplosion = useCallback((id: string) => {
    setExplosions((prev) => prev.filter((exp) => exp.id !== id));
  }, []);

  const fireLightning = useCallback(() => {
    if (gameState.weaponRecharging || !gameState.isPlaying) return;

    const timeSinceStart = Date.now() - gameStartTimeRef.current;
    if (timeSinceStart < 300) return;

    setGameState((prev) => ({
      ...prev,
      lightningActive: true,
      weaponRecharging: true,
    }));
    setRechargeProgress(0);

    checkCollision();
  }, [gameState.weaponRecharging, gameState.isPlaying, checkCollision]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        fireLightning();
      }
    };

    const handleClick = () => {
      fireLightning();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [fireLightning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700 text-center">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white mb-2">Battle Complete!</h2>
          <div className="text-6xl font-bold text-cyan-400 my-6">{gameState.score}</div>
          <p className="text-xl text-slate-300 mb-2">Planes Destroyed</p>
          <p className="text-sm text-slate-400 mb-8">
            out of {config.planeCount} enemy aircraft
          </p>
          <button
            onClick={onExit}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={gameContainerRef} className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-green-200">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-100/50 to-green-100/50"></div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition-all shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span className="font-bold">Exit</span>
        </button>

        <div className="flex gap-4">
          <div className="px-6 py-3 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="text-cyan-300 text-sm font-semibold">SCORE</div>
            <div className="text-white text-3xl font-bold">{gameState.score}</div>
          </div>

          <div className="px-6 py-3 bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="text-cyan-300 text-sm font-semibold">TIME</div>
            <div className="text-white text-3xl font-bold">{formatTime(gameState.timeRemaining)}</div>
          </div>
        </div>
      </div>

      {gameState.planes.map((plane) => (
        <Plane key={plane.id} plane={plane} />
      ))}

      {explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          x={explosion.x}
          y={explosion.y}
          onComplete={() => removeExplosion(explosion.id)}
        />
      ))}

      <Weapon
        recharging={gameState.weaponRecharging}
        lightningActive={gameState.lightningActive}
        rechargeProgress={rechargeProgress}
      />

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-800 border-t-4 border-green-700"></div>
    </div>
  );
}
