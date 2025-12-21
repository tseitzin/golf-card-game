export type GameState = 'setup' | 'countdown' | 'racing' | 'finished';

export interface CarConfig {
  id: string;
  color: string;
  number: number;
  isAI: boolean;
  playerIndex?: number;
}

export interface Car extends CarConfig {
  trackProgress: number;
  lane: number;
  laneOffset: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  lapsCompleted: number;
  lastCheckpoint: number;
  finished: boolean;
  finishPosition?: number;
  finishTime?: number;
  steeringAngle: number;
}

export interface PlayerConfig {
  color: string;
  number: number;
  style: number;
}

export interface RaceConfig {
  humanPlayers: number;
  aiRacers: number;
  laps: number;
  playerConfigs: PlayerConfig[];
}

export interface Position {
  x: number;
  y: number;
}

export interface TrackDimensions {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  trackWidth: number;
  laneCount: number;
}

export interface RaceResults {
  rankings: Car[];
  winner: Car;
}

export interface InputState {
  accelerate: boolean;
  brake: boolean;
  turnLeft: boolean;
  turnRight: boolean;
}

export type PlayerInputs = Record<number, InputState>;
