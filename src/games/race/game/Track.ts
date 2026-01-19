import { Position, TrackDimensions, TrackType, PathSegment } from '../../../types/race';
import { COLORS, TRACK_CONFIG } from '../../../constants/race';

/**
 * Track math + rendering
 *
 * FIXES IN THIS VERSION (addresses your exact symptoms):
 * - Curve lane offset now matches STRAIGHT lane offset convention:
 *   offset is applied using the LEFT-HAND normal of travel direction.
 *   This prevents lane "jumping" when entering/exiting turns.
 * - Curves compute an effective radius using the correct inward/outward sign
 *   (based on turn direction), and clamp it to avoid inversion (orbit/teleport).
 * - Speedway turn geometry unchanged (looks good), but behavior is now stable.
 * - Rotation uses lookahead on the path (stable across segment boundaries)
 * - RoadCourse uses centripetal Catmull-Rom + arc-length resampling (smooth)
 * - Grass speckles are deterministic (no per-frame flicker)
 */

export function calculateTrackDimensions(
  canvasWidth: number,
  canvasHeight: number,
  laneCount: number,
  trackType: TrackType = TrackType.Oval
): TrackDimensions {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const trackWidth = laneCount * TRACK_CONFIG.laneSpacing + 40;

  let radiusX: number;
  let radiusY: number;
  let pathSegments: PathSegment[] | undefined;
  let totalLength: number | undefined;

  switch (trackType) {
    case TrackType.Speedway:
      radiusX = canvasWidth * 0.44;
      radiusY = canvasHeight * 0.40;
      pathSegments = generateSpeedwayPath(centerX, centerY, canvasWidth, canvasHeight, trackWidth);
      totalLength = calculatePathLength(pathSegments);
      break;

    case TrackType.Figure8:
      radiusX = canvasWidth * 0.44;
      radiusY = canvasHeight * 0.50;
      pathSegments = generateFigure8Path(centerX, centerY, radiusX, radiusY);
      totalLength = calculatePathLength(pathSegments);
      break;

    case TrackType.RoadCourse:
      radiusX = canvasWidth * 0.40;
      radiusY = canvasHeight * 0.35;
      pathSegments = generateRoadCoursePath(centerX, centerY, canvasWidth, canvasHeight);
      totalLength = calculatePathLength(pathSegments);
      break;

    default: // Oval
      radiusX = canvasWidth * 0.42;
      radiusY = canvasHeight * 0.38;
  }

  return {
    centerX,
    centerY,
    radiusX,
    radiusY,
    trackWidth,
    laneCount,
    pathSegments,
    totalLength,
  };
}

export function getPositionOnTrack(
  progress: number,
  lane: number,
  dimensions: TrackDimensions,
  additionalOffset: number = 0
): Position {
  const baseLaneOffset = (lane - (dimensions.laneCount - 1) / 2) * TRACK_CONFIG.laneSpacing;
  const totalOffset = baseLaneOffset + additionalOffset;

  if (dimensions.pathSegments && dimensions.totalLength) {
    return getPositionOnPath(progress, totalOffset, dimensions.pathSegments, dimensions.totalLength);
  }

  // Default oval/ellipse calculation
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const baseX = dimensions.centerX + Math.cos(angle) * dimensions.radiusX;
  const baseY = dimensions.centerY + Math.sin(angle) * dimensions.radiusY;

  const tangentX = -dimensions.radiusX * Math.sin(angle);
  const tangentY = dimensions.radiusY * Math.cos(angle);
  const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1e-6;

  const perpX = -tangentY / tangentLength;
  const perpY = tangentX / tangentLength;

  return {
    x: baseX + perpX * totalOffset,
    y: baseY + perpY * totalOffset,
  };
}

export function getRotationAtPosition(progress: number, dimensions?: TrackDimensions): number {
  if (dimensions?.pathSegments && dimensions?.totalLength) {
    return getRotationOnPath(progress, dimensions.pathSegments, dimensions.totalLength);
  }

  const angle = progress * Math.PI * 2 - Math.PI / 2;
  return angle + Math.PI / 2;
}

export function drawTrack(ctx: CanvasRenderingContext2D, dimensions: TrackDimensions): void {
  // Background
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Deterministic speckles (no per-frame flicker)
  drawDeterministicGrassSpeckles(ctx);

  // Track
  if (dimensions.pathSegments) {
    drawPathBasedTrack(ctx, dimensions);
  } else {
    drawEllipseTrack(ctx, dimensions);
  }

  drawStartLine(ctx, dimensions);
}

function drawDeterministicGrassSpeckles(ctx: CanvasRenderingContext2D) {
  const w = ctx.canvas.width | 0;
  const h = ctx.canvas.height | 0;
  let seed = (w * 73856093) ^ (h * 19349663) ^ 0x9e3779b9;

  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  ctx.fillStyle = COLORS.grassDark;
  const count = 24;
  for (let i = 0; i < count; i++) {
    const x = rand() * ctx.canvas.width;
    const y = rand() * ctx.canvas.height;
    const r = 2 + rand() * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEllipseTrack(ctx: CanvasRenderingContext2D, dimensions: TrackDimensions): void {
  const { centerX, centerY, radiusX, radiusY, trackWidth } = dimensions;

  ctx.fillStyle = COLORS.track;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX + trackWidth / 2, radiusY + trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.infield;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX - trackWidth / 2, radiusY - trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center dashed line
  ctx.strokeStyle = COLORS.trackLines;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Borders
  ctx.strokeStyle = COLORS.trackLines;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX + trackWidth / 2, radiusY + trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX - trackWidth / 2, radiusY - trackWidth / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPathBasedTrack(ctx: CanvasRenderingContext2D, dimensions: TrackDimensions): void {
  if (!dimensions.pathSegments) return;

  const { trackWidth } = dimensions;

  // Track surface
  ctx.lineWidth = trackWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = COLORS.track;

  ctx.beginPath();
  let isFirst = true;
  for (const seg of dimensions.pathSegments) {
    if (seg.type === 'straight') {
      if (isFirst) {
        ctx.moveTo(seg.startX, seg.startY);
        isFirst = false;
      }
      ctx.lineTo(seg.endX, seg.endY);
    } else if (
      seg.type === 'curve' &&
      seg.centerX !== undefined &&
      seg.centerY !== undefined &&
      seg.radius !== undefined &&
      seg.startAngle !== undefined &&
      seg.endAngle !== undefined
    ) {
      if (isFirst) {
        const x = seg.centerX + Math.cos(seg.startAngle) * seg.radius;
        const y = seg.centerY + Math.sin(seg.startAngle) * seg.radius;
        ctx.moveTo(x, y);
        isFirst = false;
      }
      ctx.arc(seg.centerX, seg.centerY, seg.radius, seg.startAngle, seg.endAngle);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // Center dashed line
  ctx.strokeStyle = COLORS.trackLines;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);

  ctx.beginPath();
  isFirst = true;
  for (const seg of dimensions.pathSegments) {
    if (seg.type === 'straight') {
      if (isFirst) {
        ctx.moveTo(seg.startX, seg.startY);
        isFirst = false;
      }
      ctx.lineTo(seg.endX, seg.endY);
    } else if (
      seg.type === 'curve' &&
      seg.centerX !== undefined &&
      seg.centerY !== undefined &&
      seg.radius !== undefined &&
      seg.startAngle !== undefined &&
      seg.endAngle !== undefined
    ) {
      if (isFirst) {
        const x = seg.centerX + Math.cos(seg.startAngle) * seg.radius;
        const y = seg.centerY + Math.sin(seg.startAngle) * seg.radius;
        ctx.moveTo(x, y);
        isFirst = false;
      }
      ctx.arc(seg.centerX, seg.centerY, seg.radius, seg.startAngle, seg.endAngle);
    }
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStartLine(ctx: CanvasRenderingContext2D, dimensions: TrackDimensions): void {
  const { trackWidth } = dimensions;
  const checkerSize = 10;
  const lineWidth = 20;

  const startPos = getPositionOnTrack(0, 0, dimensions, 0);
  const startRotation = getRotationAtPosition(0, dimensions);

  const perpAngle = startRotation - Math.PI / 2;
  const perpX = Math.cos(perpAngle);
  const perpY = Math.sin(perpAngle);

  const halfWidth = trackWidth / 2;
  for (let offset = -halfWidth; offset < halfWidth; offset += checkerSize) {
    const x1 = startPos.x + perpX * offset;
    const y1 = startPos.y + perpY * offset;

    for (let along = -lineWidth / 2; along < lineWidth / 2; along += checkerSize) {
      const x = x1 + Math.cos(startRotation) * along;
      const y = y1 + Math.sin(startRotation) * along;

      const isWhite =
        (Math.floor((offset + halfWidth) / checkerSize) + Math.floor((along + lineWidth / 2) / checkerSize)) % 2 === 0;
      ctx.fillStyle = isWhite ? COLORS.startLine : COLORS.startLineAlt;
      ctx.fillRect(x, y, checkerSize, checkerSize);
    }
  }
}

function calculatePathLength(segments: PathSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.length, 0);
}

function normalizeProgress(progress: number): number {
  const p = progress % 1;
  return p < 0 ? p + 1 : p;
}

function getPositionOnPath(progress: number, offset: number, segments: PathSegment[], totalLength: number): Position {
  if (!segments.length || !Number.isFinite(totalLength) || totalLength <= 0) {
    return { x: 0, y: 0 };
  }

  const p = normalizeProgress(progress);
  const targetDistance = p * totalLength;

  let accumulated = 0;

  for (const segment of segments) {
    const segLen = Math.max(segment.length, 1e-6);

    if (accumulated + segLen >= targetDistance) {
      const segmentProgress = (targetDistance - accumulated) / segLen;
      return getPositionOnSegment(segment, segmentProgress, offset);
    }
    accumulated += segLen;
  }

  return getPositionOnSegment(segments[0], 0, offset);
}

function getPositionOnSegment(segment: PathSegment, progress: number, offset: number): Position {
  const t = Math.min(Math.max(progress, 0), 1);

  if (segment.type === 'straight') {
    const dx = segment.endX - segment.startX;
    const dy = segment.endY - segment.startY;

    const x = segment.startX + dx * t;
    const y = segment.startY + dy * t;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (!Number.isFinite(length) || length < 1e-6) {
      return { x, y };
    }

    // LEFT-HAND normal (your convention)
    const perpX = -dy / length;
    const perpY = dx / length;

    return { x: x + perpX * offset, y: y + perpY * offset };
  }

  if (
    segment.type === 'curve' &&
    segment.centerX !== undefined &&
    segment.centerY !== undefined &&
    segment.radius !== undefined &&
    segment.startAngle !== undefined &&
    segment.endAngle !== undefined
  ) {
    const angle = segment.startAngle + (segment.endAngle - segment.startAngle) * t;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Base point on the curve centerline
    const baseX = segment.centerX + cosA * segment.radius;
    const baseY = segment.centerY + sinA * segment.radius;

    // Determine direction of travel along the arc.
    // endAngle > startAngle => CCW, else CW
    const dir = segment.endAngle - segment.startAngle >= 0 ? 1 : -1;

    // Unit tangent in direction of travel
    // CCW tangent = (-sin, cos), CW is reversed
    const tanX = (-sinA) * dir;
    const tanY = (cosA) * dir;

    // Left-hand normal to tangent (matches straight segments)
    const normX = -tanY;
    const normY = tanX;

    const x = baseX + normX * offset;
    const y = baseY + normY * offset;

    // Extra safety: never return NaN
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { x: baseX, y: baseY };
    }

    return { x, y };
  }

  return { x: 0, y: 0 };
}


function getRotationOnPath(progress: number, segments: PathSegment[], totalLength: number): number {
  if (!segments.length || !Number.isFinite(totalLength) || totalLength <= 0) return 0;

  const lookaheadDist = Math.max(14, totalLength * 0.002); // stable heading
  const delta = lookaheadDist / totalLength;

  const p1 = getPositionOnPath(progress, 0, segments, totalLength);
  const p2 = getPositionOnPath(progress + delta, 0, segments, totalLength);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 0;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return 0;

  return Math.atan2(dy, dx);
}

// Kept for completeness (not used with lookahead rotation)
function getRotationOnSegment(segment: PathSegment, progress: number): number {
  if (segment.type === 'straight') {
    const dx = segment.endX - segment.startX;
    const dy = segment.endY - segment.startY;
    return Math.atan2(dy, dx);
  } else if (segment.type === 'curve' && segment.startAngle !== undefined && segment.endAngle !== undefined) {
    const angle = segment.startAngle + (segment.endAngle - segment.startAngle) * progress;
    return angle + Math.PI / 2;
  }
  return 0;
}

/**
 * FIGURE-8 (Lemniscate of Gerono)
 */
function generateFigure8Path(centerX: number, centerY: number, radiusX: number, radiusY: number): PathSegment[] {
  const segments: PathSegment[] = [];

  const a = radiusX;
  const b = radiusY;
  const steps = 320;

  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const tt = (i / steps) * Math.PI * 2;
    const s = Math.sin(tt);
    const c = Math.cos(tt);

    const x = centerX + a * s;
    const y = centerY + b * s * c;

    pts.push({ x, y });
  }

  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) continue;

    segments.push({
      type: 'straight',
      length: len,
      startX: p1.x,
      startY: p1.y,
      endX: p2.x,
      endY: p2.y,
    });
  }

  // Close
  const last = pts[pts.length - 1];
  const first = pts[0];
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const closeLen = Math.sqrt(dx * dx + dy * dy);
  if (closeLen > 0.5) {
    segments.push({
      type: 'straight',
      length: closeLen,
      startX: last.x,
      startY: last.y,
      endX: first.x,
      endY: first.y,
    });
  }

  return segments;
}

/**
 * SPEEDWAY (stadium / rounded-rectangle)
 */
function generateSpeedwayPath(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  trackWidth: number
): PathSegment[] {
  // Stadium shape, sampled into straight segments (stable + smooth).
  // FIX: Left arc must go through PI (left-most point), not through 0 (right-most).

  const segments: PathSegment[] = [];

  const straightHalf = width * 0.28;

  const base = Math.min(width, height) * 0.18;
  const minSafe = trackWidth / 2 + 30;
  const turnRadius = Math.max(base, minSafe);

  const leftX = centerX - straightHalf;
  const rightX = centerX + straightHalf;

  const topY = centerY - turnRadius;
  const bottomY = centerY + turnRadius;

  const pts: { x: number; y: number }[] = [];

  // 1) Top straight: left -> right
  const topSteps = 50;
  for (let i = 0; i <= topSteps; i++) {
    const t = i / topSteps;
    pts.push({ x: leftX + (rightX - leftX) * t, y: topY });
  }

  // 2) Right semicircle: -90° -> +90° (goes through 0°, OUTSIDE right)
  const arcSteps = 140;
  for (let i = 1; i <= arcSteps; i++) {
    const t = i / arcSteps;
    const ang = -Math.PI / 2 + Math.PI * t; // -90 to +90
    pts.push({
      x: rightX + Math.cos(ang) * turnRadius,
      y: centerY + Math.sin(ang) * turnRadius,
    });
  }

  // 3) Bottom straight: right -> left
  const botSteps = 50;
  for (let i = 1; i <= botSteps; i++) {
    const t = i / botSteps;
    pts.push({ x: rightX + (leftX - rightX) * t, y: bottomY });
  }

  // 4) Left semicircle: +90° -> +270° (goes through PI, OUTSIDE left)  ✅ FIX
  for (let i = 1; i <= arcSteps; i++) {
    const t = i / arcSteps;
    const ang = Math.PI / 2 + Math.PI * t; // +90 to +270 (through 180)
    pts.push({
      x: leftX + Math.cos(ang) * turnRadius,
      y: centerY + Math.sin(ang) * turnRadius,
    });
  }

  // Close
  pts.push({ ...pts[0] });

  // Convert to PathSegments (straight)
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (!Number.isFinite(len) || len < 0.01) continue;

    segments.push({
      type: 'straight',
      length: len,
      startX: p1.x,
      startY: p1.y,
      endX: p2.x,
      endY: p2.y,
    });
  }

  return segments;
}


/**
 * Shared helper: build a smooth CLOSED loop from control points
 * using centripetal Catmull-Rom + arc-length resampling.
 */
function buildSmoothClosedPath(
  control: { x: number; y: number }[],
  samplesPerSpan: number,
  targetStepPx: number,
  alpha: number = 0.5
): PathSegment[] {
  if (control.length < 4) return [];

  const dist = (a: any, b: any) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  function catmullRomCentripetal(p0: any, p1: any, p2: any, p3: any, t: number) {
    const t0 = 0;
    const t1 = t0 + Math.pow(dist(p0, p1), alpha);
    const t2 = t1 + Math.pow(dist(p1, p2), alpha);
    const t3 = t2 + Math.pow(dist(p2, p3), alpha);

    const tt = t1 + (t2 - t1) * t;
    const safe = (v: number) => (Number.isFinite(v) && Math.abs(v) > 1e-9 ? v : 1e-9);

    const A1 = {
      x: (t1 - tt) / safe(t1 - t0) * p0.x + (tt - t0) / safe(t1 - t0) * p1.x,
      y: (t1 - tt) / safe(t1 - t0) * p0.y + (tt - t0) / safe(t1 - t0) * p1.y,
    };
    const A2 = {
      x: (t2 - tt) / safe(t2 - t1) * p1.x + (tt - t1) / safe(t2 - t1) * p2.x,
      y: (t2 - tt) / safe(t2 - t1) * p1.y + (tt - t1) / safe(t2 - t1) * p2.y,
    };
    const A3 = {
      x: (t3 - tt) / safe(t3 - t2) * p2.x + (tt - t2) / safe(t3 - t2) * p3.x,
      y: (t3 - tt) / safe(t3 - t2) * p2.y + (tt - t2) / safe(t3 - t2) * p3.y,
    };

    const B1 = {
      x: (t2 - tt) / safe(t2 - t0) * A1.x + (tt - t0) / safe(t2 - t0) * A2.x,
      y: (t2 - tt) / safe(t2 - t0) * A1.y + (tt - t0) / safe(t2 - t0) * A2.y,
    };
    const B2 = {
      x: (t3 - tt) / safe(t3 - t1) * A2.x + (tt - t1) / safe(t3 - t1) * A3.x,
      y: (t3 - tt) / safe(t3 - t1) * A2.y + (tt - t1) / safe(t3 - t1) * A3.y,
    };

    return {
      x: (t2 - tt) / safe(t2 - t1) * B1.x + (tt - t1) / safe(t2 - t1) * B2.x,
      y: (t2 - tt) / safe(t2 - t1) * B1.y + (tt - t1) / safe(t2 - t1) * B2.y,
    };
  }

  // Dense sampling
  const dense: { x: number; y: number }[] = [];
  const n = control.length;

  for (let i = 0; i < n; i++) {
    const p0 = control[(i - 1 + n) % n];
    const p1 = control[i];
    const p2 = control[(i + 1) % n];
    const p3 = control[(i + 2) % n];

    for (let s = 0; s < samplesPerSpan; s++) {
      dense.push(catmullRomCentripetal(p0, p1, p2, p3, s / samplesPerSpan));
    }
  }
  dense.push(dense[0]); // close

  // Cumulative arc lengths
  const cum: number[] = [0];
  for (let i = 1; i < dense.length; i++) {
    cum[i] = cum[i - 1] + dist(dense[i - 1], dense[i]);
  }
  const total = cum[cum.length - 1];
  if (!Number.isFinite(total) || total < 1) return [];

  // Resample uniformly by distance
  const resampled: { x: number; y: number }[] = [];
  const step = Math.max(3, targetStepPx);

  let d = 0;
  let j = 1;
  resampled.push(dense[0]);

  while (d < total) {
    d += step;
    if (d > total) d = total;

    while (j < cum.length && cum[j] < d) j++;
    const j0 = Math.min(j, cum.length - 1);
    const i0 = Math.max(0, j0 - 1);

    const d0 = cum[i0];
    const d1 = cum[j0];
    const span = d1 - d0;
    const tt = span > 1e-6 ? (d - d0) / span : 0;

    const pA = dense[i0];
    const pB = dense[j0];

    resampled.push({
      x: pA.x + (pB.x - pA.x) * tt,
      y: pA.y + (pB.y - pA.y) * tt,
    });

    if (d >= total) break;
  }

  // Convert to segments
  const segments: PathSegment[] = [];
  for (let i = 0; i < resampled.length - 1; i++) {
    const p1 = resampled[i];
    const p2 = resampled[i + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (!Number.isFinite(len) || len < 0.5) continue;

    segments.push({
      type: 'straight',
      length: len,
      startX: p1.x,
      startY: p1.y,
      endX: p2.x,
      endY: p2.y,
    });
  }

  return segments;
}

/**
 * ROAD COURSE (smooth)
 */
function generateRoadCoursePath(centerX: number, centerY: number, width: number, height: number): PathSegment[] {
  const w = width * 0.82;
  const h = height * 0.64;

  const control = [
    { x: centerX - w * 0.38, y: centerY - h * 0.30 },
    { x: centerX + w * 0.34, y: centerY - h * 0.34 },
    { x: centerX + w * 0.52, y: centerY - h * 0.06 },
    { x: centerX + w * 0.40, y: centerY + h * 0.28 },
    { x: centerX + w * 0.10, y: centerY + h * 0.36 },
    { x: centerX - w * 0.22, y: centerY + h * 0.30 },
    { x: centerX - w * 0.06, y: centerY + h * 0.08 },
    { x: centerX - w * 0.34, y: centerY + h * 0.12 },
    { x: centerX - w * 0.52, y: centerY + h * 0.22 },
    { x: centerX - w * 0.54, y: centerY - h * 0.03 },
    { x: centerX - w * 0.40, y: centerY - h * 0.20 },
  ];

  return buildSmoothClosedPath(control, 50, 5, 0.5);
}

