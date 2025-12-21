import { Car, Position } from '../../types/race';

const CAR_LENGTH = 40;
const CAR_WIDTH = 18;

export function drawCar(
  ctx: CanvasRenderingContext2D,
  car: Car,
  position: Position,
  rotation: number
): void {
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(rotation);

  drawNascarBody(ctx, car.color);
  drawCarNumber(ctx, car.number);

  ctx.restore();
}

function drawNascarBody(ctx: CanvasRenderingContext2D, color: string): void {
  const halfLength = CAR_LENGTH / 2;
  const halfWidth = CAR_WIDTH / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-halfLength + 5, -halfWidth);
  ctx.lineTo(halfLength - 12, -halfWidth);
  ctx.quadraticCurveTo(halfLength, -halfWidth + 2, halfLength, 0);
  ctx.quadraticCurveTo(halfLength, halfWidth - 2, halfLength - 12, halfWidth);
  ctx.lineTo(-halfLength + 5, halfWidth);
  ctx.quadraticCurveTo(-halfLength, halfWidth - 3, -halfLength, 0);
  ctx.quadraticCurveTo(-halfLength, -halfWidth + 3, -halfLength + 5, -halfWidth);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(0, -halfWidth + 2);
  ctx.lineTo(halfLength - 15, -halfWidth + 3);
  ctx.lineTo(halfLength - 12, 0);
  ctx.lineTo(halfLength - 15, halfWidth - 3);
  ctx.lineTo(0, halfWidth - 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#87CEEB';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(2, -halfWidth + 3);
  ctx.lineTo(halfLength - 17, -halfWidth + 4);
  ctx.lineTo(halfLength - 14, 0);
  ctx.lineTo(halfLength - 17, halfWidth - 4);
  ctx.lineTo(2, halfWidth - 3);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#333333';
  ctx.fillRect(-halfLength - 2, -halfWidth - 2, 8, 4);
  ctx.fillRect(-halfLength - 2, halfWidth - 2, 8, 4);
  ctx.fillRect(halfLength - 10, -halfWidth - 1, 6, 3);
  ctx.fillRect(halfLength - 10, halfWidth - 2, 6, 3);

  ctx.fillStyle = '#222222';
  ctx.fillRect(-halfLength + 2, -halfWidth - 4, 3, 2);
  ctx.fillRect(-halfLength + 2, halfWidth + 2, 3, 2);
}

function drawCarNumber(ctx: CanvasRenderingContext2D, number: number): void {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = number.toString();
  ctx.strokeText(text, -8, 0);
  ctx.fillText(text, -8, 0);
  ctx.restore();
}

export function drawCarPreview(
  ctx: CanvasRenderingContext2D,
  color: string,
  number: number,
  x: number,
  y: number,
  scale: number = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(-Math.PI / 2);

  drawNascarBody(ctx, color);
  drawCarNumber(ctx, number);

  ctx.restore();
}
