import { Position, TrackDimensions } from '../../../types/race';
import { COLORS, TRACK_CONFIG } from '../../../constants/race/index.ts';

export function calculateTrackDimensions(
  canvasWidth: number,
  canvasHeight: number,
  laneCount: number
): TrackDimensions {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const maxRadiusX = canvasWidth * 0.42;
  const maxRadiusY = canvasHeight * 0.38;
  const trackWidth = laneCount * TRACK_CONFIG.laneSpacing + 40;

  return {
    centerX,
    centerY,
    radiusX: maxRadiusX,
    radiusY: maxRadiusY,
    trackWidth,
    laneCount,
  };
}

export function getPositionOnTrack(
  progress: number,
  lane: number,
  dimensions: TrackDimensions,
  additionalOffset: number = 0
): Position {
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const baseLaneOffset = (lane - (dimensions.laneCount - 1) / 2) * TRACK_CONFIG.laneSpacing;
  const totalOffset = baseLaneOffset + additionalOffset;

  const baseX = dimensions.centerX + Math.cos(angle) * dimensions.radiusX;
  const baseY = dimensions.centerY + Math.sin(angle) * dimensions.radiusY;

  const tangentX = -dimensions.radiusX * Math.sin(angle);
  const tangentY = dimensions.radiusY * Math.cos(angle);
  const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);

  const perpX = -tangentY / tangentLength;
  const perpY = tangentX / tangentLength;

  return {
    x: baseX + perpX * totalOffset,
    y: baseY + perpY * totalOffset,
  };
}

export function getRotationAtPosition(progress: number): number {
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  return angle + Math.PI / 2;
}

export function drawTrack(
  ctx: CanvasRenderingContext2D,
  dimensions: TrackDimensions
): void {
  const { centerX, centerY, radiusX, radiusY, trackWidth } = dimensions;

  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = COLORS.grassDark;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * ctx.canvas.width;
    const y = Math.random() * ctx.canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = COLORS.track;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX + trackWidth / 2, radiusY + trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.infield;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX - trackWidth / 2, radiusY - trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.trackLines;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = COLORS.trackLines;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX + trackWidth / 2, radiusY + trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX - trackWidth / 2, radiusY - trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  drawStartLine(ctx, dimensions);
}

function drawStartLine(
  ctx: CanvasRenderingContext2D,
  dimensions: TrackDimensions
): void {
  const { centerX, centerY, radiusY, trackWidth } = dimensions;
  const startX = centerX;
  const startYOuter = centerY - radiusY - trackWidth / 2;
  const startYInner = centerY - radiusY + trackWidth / 2;
  const checkerSize = 10;
  const lineWidth = 20;

  for (let y = startYOuter; y < startYInner; y += checkerSize) {
    for (let x = startX - lineWidth / 2; x < startX + lineWidth / 2; x += checkerSize) {
      const isWhite = ((x - startX + lineWidth / 2) / checkerSize + (y - startYOuter) / checkerSize) % 2 < 1;
      ctx.fillStyle = isWhite ? COLORS.startLine : COLORS.startLineAlt;
      ctx.fillRect(x, y, checkerSize, checkerSize);
    }
  }
}
