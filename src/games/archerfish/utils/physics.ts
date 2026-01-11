import type { Position, Fish, Robot, Obstacle } from '../types';

export function checkCollision(pos1: Position, pos2: Position, threshold: number = 30): boolean {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < threshold;
}

export function checkObstacleCollision(
  position: Position,
  obstacle: Obstacle,
  entityRadius: number = 15
): boolean {
  const closestX = Math.max(obstacle.position.x, Math.min(position.x, obstacle.position.x + obstacle.width));
  const closestY = Math.max(obstacle.position.y, Math.min(position.y, obstacle.position.y + obstacle.height));

  const dx = position.x - closestX;
  const dy = position.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < entityRadius;
}

export function resolveObstacleCollision(
  position: Position,
  velocity: { x: number; y: number },
  obstacles: Obstacle[],
  entityRadius: number = 15
): { position: Position; velocity: { x: number; y: number } } {
  let nextX = position.x + velocity.x;
  let nextY = position.y + velocity.y;
  let newVelX = velocity.x;
  let newVelY = velocity.y;

  for (const obstacle of obstacles) {
    const nextPos = { x: nextX, y: nextY };

    if (checkObstacleCollision(nextPos, obstacle, entityRadius)) {
      const closestX = Math.max(obstacle.position.x, Math.min(nextX, obstacle.position.x + obstacle.width));
      const closestY = Math.max(obstacle.position.y, Math.min(nextY, obstacle.position.y + obstacle.height));

      const dx = nextX - closestX;
      const dy = nextY - closestY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const normalX = dx / distance;
      const normalY = dy / distance;

      const overlap = entityRadius - distance;
      nextX += normalX * (overlap + 2);
      nextY += normalY * (overlap + 2);

      const dotProduct = newVelX * normalX + newVelY * normalY;
      if (dotProduct < 0) {
        newVelX -= 2 * dotProduct * normalX;
        newVelY -= 2 * dotProduct * normalY;

        newVelX *= 0.8;
        newVelY *= 0.8;
      }
    }
  }

  return {
    position: { x: nextX, y: nextY },
    velocity: { x: newVelX, y: newVelY }
  };
}

export function keepInBounds(
  position: Position,
  velocity: { x: number; y: number },
  width: number,
  height: number,
  margin: number = 30
): Position {
  let newX = position.x;
  let newY = position.y;

  if (newX < margin) {
    newX = margin;
  } else if (newX > width - margin) {
    newX = width - margin;
  }

  if (newY < margin) {
    newY = margin;
  } else if (newY > height - margin) {
    newY = height - margin;
  }

  return { x: newX, y: newY };
}

export function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

export function getDistanceBetweenPoints(p1: Position, p2: Position): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
