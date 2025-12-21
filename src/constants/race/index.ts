export const CAR_COLORS = [
  { name: 'Red', value: '#E53935' },
  { name: 'Blue', value: '#1E88E5' },
  { name: 'Green', value: '#43A047' },
  { name: 'Orange', value: '#FB8C00' },
  { name: 'Yellow', value: '#FDD835' },
  { name: 'Cyan', value: '#00ACC1' },
  { name: 'Pink', value: '#EC407A' },
  { name: 'White', value: '#FAFAFA' },
];

export const KEYBOARD_CONTROLS = [
  { accelerate: 'KeyW', brake: 'KeyS', turnLeft: 'KeyA', turnRight: 'KeyD', alternate: 'Space', label: 'W-Space / A-D / S' },
  { accelerate: 'ArrowUp', brake: 'ArrowDown', turnLeft: 'ArrowLeft', turnRight: 'ArrowRight', label: 'Arrows' },
  { accelerate: 'KeyI', brake: 'KeyK', turnLeft: 'KeyJ', turnRight: 'KeyL', label: 'I-J-K-L' },
  { accelerate: 'Numpad8', brake: 'Numpad5', turnLeft: 'Numpad4', turnRight: 'Numpad6', label: 'Num 8-4-5-6' },
];

export const GAME_CONFIG = {
  maxHumanPlayers: 4,
  maxTotalRacers: 8,
  minLaps: 1,
  maxLaps: 20,
  defaultLaps: 3,
  countdownDuration: 1000,
};

export const CAR_PHYSICS = {
  baseMaxSpeed: 0.0002,
  speedVariation: 0.00002,
  acceleration: 0.000004,
  deceleration: 0.000005,
  coastDeceleration: 0.00000075,
  aiSpeedFactor: 0.95,
  aiSpeedVariation: 0.000025,
  turnSpeed: 0.25,
  maxTurnAngle: 0.3,
  laneWidth: 30,
};

export const TRACK_CONFIG = {
  trackWidthRatio: 0.25,
  innerRadiusRatio: 0.35,
  laneSpacing: 30,
};

export const COLORS = {
  grass: '#2C3E50',
  grassDark: '#1A252F',
  track: '#424242',
  trackLines: '#FFFFFF',
  startLine: '#FFFFFF',
  startLineAlt: '#212121',
  infield: '#34495E',
};
