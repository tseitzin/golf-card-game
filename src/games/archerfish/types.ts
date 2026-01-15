export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameDuration = 60 | 120 | 180 | 240 | 300;

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Fish {
  id: number;
  position: Position;
  velocity: Velocity;
  isHuman: boolean;
  name: string;
  color: string;
  isFrozen: boolean;
  frozenUntil: number;
  survivalTime: number;
  frozenTime: number;
  lastWaterJetTime: number;
  waterJetCooldown: number;
  controlKeys?: {
    up: string;
    down: string;
    left: string;
    right: string;
    boost: string;
    shoot: string;
  };
}

export interface WaterJet {
  id: string;
  position: Position;
  velocity: Velocity;
  fishId: number;
  createdAt: number;
}

export interface Robot {
  id: number;
  position: Position;
  velocity: Velocity;
  targetFishId: number | null;
  speed: number;
}

export interface Obstacle {
  id: number;
  position: Position;
  width: number;
  height: number;
  type: 'seaweed' | 'island' | 'iceberg' | 'coral';
}

export interface GameState {
  fish: Fish[];
  robots: Robot[];
  obstacles: Obstacle[];
  waterJets: WaterJet[];
  gameTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  winner: Fish | null;
}

export interface GameConfig {
  numPlayers: number;
  numRobots: number;
  humanPlayers: boolean[];
  playerNames: string[];
  playerColors?: string[];
  duration: GameDuration;
  difficulty: Difficulty;
}

export interface GameSession {
  id?: string;
  game_duration: number;
  difficulty: Difficulty;
  num_players: number;
  winner_name: string;
  created_at?: string;
}

export interface PlayerStats {
  id?: string;
  player_name: string;
  games_played: number;
  total_wins: number;
  total_survival_time: number;
  best_survival_time: number;
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  id?: string;
  game_session_id?: string;
  player_name: string;
  survival_time: number;
  difficulty: Difficulty;
  is_human: boolean;
  created_at?: string;
}
