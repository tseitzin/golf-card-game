import type { Fish, Robot, Obstacle, GameConfig, Difficulty } from '../types';

const FISH_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const CONTROL_SCHEMES = [
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', boost: ' ' },
  { up: 'w', down: 's', left: 'a', right: 'd', boost: 'Shift' },
  { up: 'i', down: 'k', left: 'j', right: 'l', boost: 'Enter' },
  { up: 't', down: 'g', left: 'f', right: 'h', boost: 'q' },
];

export function initializeFish(config: GameConfig, arenaWidth: number, arenaHeight: number): Fish[] {
  const fish: Fish[] = [];
  let humanPlayerIndex = 0;
  let aiPlayerIndex = 0;

  for (let i = 0; i < config.numPlayers; i++) {
    const isHuman = config.humanPlayers[i];
    const yPosition = (arenaHeight / (config.numPlayers + 1)) * (i + 1);

    const newFish: Fish = {
      id: i,
      position: { x: 100, y: yPosition },
      velocity: { x: 0, y: 0 },
      isHuman,
      name: config.playerNames[i],
      color: FISH_COLORS[i],
      isFrozen: false,
      frozenUntil: 0,
      survivalTime: 0,
      frozenTime: 0,
      controlKeys: isHuman ? CONTROL_SCHEMES[humanPlayerIndex++] : undefined,
    };

    if (!isHuman) {
      aiPlayerIndex++;
    }

    fish.push(newFish);
  }

  return fish;
}

export function initializeRobots(numRobots: number, difficulty: Difficulty, arenaWidth: number, arenaHeight: number): Robot[] {
  const speedMap = {
    easy: 1.5,
    medium: 2.5,
    hard: 3.5,
  };

  const robots: Robot[] = [];

  for (let i = 0; i < numRobots; i++) {
    const yPosition = (arenaHeight / (numRobots + 1)) * (i + 1);
    robots.push({
      id: i,
      position: { x: arenaWidth - 100, y: yPosition },
      velocity: { x: 0, y: 0 },
      targetFishId: null,
      speed: speedMap[difficulty],
    });
  }

  return robots;
}

export function initializeObstacles(arenaWidth: number, arenaHeight: number): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const numObstacles = 6;
  const types: Array<'seaweed' | 'island' | 'iceberg' | 'coral'> = ['seaweed', 'island', 'iceberg', 'coral'];

  const safeZoneLeft = 250;
  const safeZoneRight = arenaWidth - 250;
  const safeZoneTop = 150;
  const safeZoneBottom = arenaHeight - 150;

  for (let i = 0; i < numObstacles; i++) {
    const type = types[Math.floor(Math.random() * types.length)];

    let width, height;
    if (type === 'seaweed') {
      width = 35;
      height = 80;
    } else if (type === 'island') {
      width = 100;
      height = 70;
    } else if (type === 'iceberg') {
      width = 80;
      height = 80;
    } else {
      width = 60;
      height = 50;
    }

    let x, y;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      x = safeZoneLeft + Math.random() * (safeZoneRight - safeZoneLeft);
      y = safeZoneTop + Math.random() * (safeZoneBottom - safeZoneTop);
      attempts++;

      const tooClose = obstacles.some(obs => {
        const dx = x - obs.position.x;
        const dy = y - obs.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 220;
      });

      if (!tooClose || attempts >= maxAttempts) break;
    } while (true);

    obstacles.push({
      id: i,
      position: { x, y },
      width,
      height,
      type,
    });
  }

  return obstacles;
}
