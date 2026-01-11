import type { Fish, Robot, Obstacle, Position } from '../types';
import { getDistanceBetweenPoints, normalizeVector, checkObstacleCollision } from './physics';

export function updateAIFish(
  fish: Fish,
  robots: Robot[],
  obstacles: Obstacle[],
  arenaWidth: number,
  arenaHeight: number,
  deltaTime: number
): { x: number; y: number } {
  if (fish.isFrozen) {
    return { x: 0, y: 0 };
  }

  let targetVelX = 0;
  let targetVelY = 0;

  const closestRobot = robots.reduce((closest, current) => {
    const distCurrent = getDistanceBetweenPoints(fish.position, current.position);
    const distClosest = getDistanceBetweenPoints(fish.position, closest.position);
    return distCurrent < distClosest ? current : closest;
  }, robots[0]);

  const distanceToRobot = getDistanceBetweenPoints(fish.position, closestRobot.position);
  const dangerZone = 200;

  if (distanceToRobot < dangerZone) {
    const awayX = fish.position.x - closestRobot.position.x;
    const awayY = fish.position.y - closestRobot.position.y;
    const normalized = normalizeVector(awayX, awayY);

    targetVelX = normalized.x * 4;
    targetVelY = normalized.y * 4;
  } else {
    const time = Date.now() / 1000;
    const randomFactor = Math.sin(time + fish.id * 100);

    targetVelX = Math.cos(time * 0.5 + fish.id) * 2;
    targetVelY = Math.sin(time * 0.3 + fish.id) * 2 + randomFactor * 0.5;
  }

  const nearbyObstacle = obstacles.find(obs =>
    checkObstacleCollision(fish.position, obs, 80)
  );

  if (nearbyObstacle) {
    const obstacleCenterX = nearbyObstacle.position.x + nearbyObstacle.width / 2;
    const obstacleCenterY = nearbyObstacle.position.y + nearbyObstacle.height / 2;
    const awayX = fish.position.x - obstacleCenterX;
    const awayY = fish.position.y - obstacleCenterY;
    const normalized = normalizeVector(awayX, awayY);

    targetVelX += normalized.x * 3;
    targetVelY += normalized.y * 3;
  }

  const margin = 80;
  if (fish.position.x < margin) {
    targetVelX += 2;
  } else if (fish.position.x > arenaWidth - margin) {
    targetVelX -= 2;
  }

  if (fish.position.y < margin) {
    targetVelY += 2;
  } else if (fish.position.y > arenaHeight - margin) {
    targetVelY -= 2;
  }

  const smoothing = 0.1;
  const newVelX = fish.velocity.x + (targetVelX - fish.velocity.x) * smoothing;
  const newVelY = fish.velocity.y + (targetVelY - fish.velocity.y) * smoothing;

  return { x: newVelX, y: newVelY };
}

export function updateRobot(
  robot: Robot,
  fish: Fish[],
  obstacles: Obstacle[],
  difficulty: string,
  deltaTime: number
): { velocity: { x: number; y: number }; targetFishId: number | null } {
  const activeFish = fish.filter(f => !f.isFrozen);
  const frozenFish = fish.filter(f => f.isFrozen);

  if (activeFish.length === 0) {
    return { velocity: { x: 0, y: 0 }, targetFishId: null };
  }

  const closestFrozenFish = frozenFish.reduce<{ fish: Fish | null; distance: number }>(
    (closest, frozen) => {
      const dist = getDistanceBetweenPoints(robot.position, frozen.position);
      if (dist < closest.distance) {
        return { fish: frozen, distance: dist };
      }
      return closest;
    },
    { fish: null, distance: Infinity }
  );

  if (closestFrozenFish.fish && closestFrozenFish.distance < 150) {
    let awayX = robot.position.x - closestFrozenFish.fish.position.x;
    let awayY = robot.position.y - closestFrozenFish.fish.position.y;

    if (Math.abs(awayX) < 5 && Math.abs(awayY) < 5) {
      const angle = Math.random() * Math.PI * 2;
      awayX = Math.cos(angle) * 10;
      awayY = Math.sin(angle) * 10;
    }

    const awayNormalized = normalizeVector(awayX, awayY);
    const escapeSpeed = robot.speed * 2.5;

    if (closestFrozenFish.distance < 60) {
      return {
        velocity: {
          x: awayNormalized.x * escapeSpeed,
          y: awayNormalized.y * escapeSpeed,
        },
        targetFishId: null,
      };
    } else {
      const mediumSmoothing = 0.6;
      const escapeVelX = awayNormalized.x * escapeSpeed;
      const escapeVelY = awayNormalized.y * escapeSpeed;
      const newVelX = robot.velocity.x + (escapeVelX - robot.velocity.x) * mediumSmoothing;
      const newVelY = robot.velocity.y + (escapeVelY - robot.velocity.y) * mediumSmoothing;

      return {
        velocity: { x: newVelX, y: newVelY },
        targetFishId: null,
      };
    }
  }

  let targetFish: Fish | null = null;

  if (robot.targetFishId !== null) {
    const currentTarget = activeFish.find(f => f.id === robot.targetFishId);
    if (currentTarget) {
      const distanceToCurrentTarget = getDistanceBetweenPoints(robot.position, currentTarget.position);

      if (distanceToCurrentTarget < 400) {
        targetFish = currentTarget;
      }
    }
  }

  if (!targetFish) {
    const sortedByDistance = activeFish
      .map(f => ({
        fish: f,
        distance: getDistanceBetweenPoints(robot.position, f.position)
      }))
      .sort((a, b) => a.distance - b.distance);

    const robotTime = Math.floor(Date.now() / 5000);
    const targetIndex = (robot.id + robotTime) % sortedByDistance.length;
    targetFish = sortedByDistance[targetIndex].fish;
  }

  const dx = targetFish.position.x - robot.position.x;
  const dy = targetFish.position.y - robot.position.y;
  const normalized = normalizeVector(dx, dy);

  let speed = robot.speed;
  const distanceToTarget = getDistanceBetweenPoints(robot.position, targetFish.position);

  if (difficulty === 'hard' && distanceToTarget < 150) {
    speed *= 1.3;
  }

  let targetVelX = normalized.x * speed;
  let targetVelY = normalized.y * speed;

  const nearbyObstacle = obstacles.find(obs =>
    checkObstacleCollision(robot.position, obs, 60)
  );

  if (nearbyObstacle) {
    const obstacleCenterX = nearbyObstacle.position.x + nearbyObstacle.width / 2;
    const obstacleCenterY = nearbyObstacle.position.y + nearbyObstacle.height / 2;

    const awayX = robot.position.x - obstacleCenterX;
    const awayY = robot.position.y - obstacleCenterY;
    const awayNormalized = normalizeVector(awayX, awayY);

    const avoidStrength = 2;
    targetVelX += awayNormalized.x * avoidStrength;
    targetVelY += awayNormalized.y * avoidStrength;
  }

  const smoothing = difficulty === 'easy' ? 0.05 : difficulty === 'medium' ? 0.08 : 0.12;
  const newVelX = robot.velocity.x + (targetVelX - robot.velocity.x) * smoothing;
  const newVelY = robot.velocity.y + (targetVelY - robot.velocity.y) * smoothing;

  return {
    velocity: { x: newVelX, y: newVelY },
    targetFishId: targetFish.id,
  };
}
