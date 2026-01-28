export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  planeCount: 10 | 15 | 20;
  duration: number;
  difficulty: Difficulty;
}

export interface Plane {
  id: string;
  number: number;
  x: number;
  y: number;
  direction: 'left' | 'right';
  speed: number;
  variety: number;
  width: number;
  height: number;
}

export interface GameState {
  planes: Plane[];
  score: number;
  timeRemaining: number;
  isPlaying: boolean;
  weaponRecharging: boolean;
  lightningActive: boolean;
}
