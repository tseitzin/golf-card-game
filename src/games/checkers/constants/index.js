export const PLAYER_COLORS = {
  RED: 'red',
  BLACK: 'black'
};

export const PIECE_TYPES = {
  NORMAL: 'normal',
  KING: 'king'
};

export const GAME_MODES = {
  HUMAN_VS_HUMAN: 'human-vs-human',
  HUMAN_VS_COMPUTER: 'human-vs-computer'
};

export const GAME_STATES = {
  SETUP: 'setup',
  PLAYING: 'playing',
  ENDED: 'ended'
};

export const BOARD_SIZE = 8;

export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const SQUARE_COLORS = {
  LIGHT: '#fef3c7',
  DARK: '#86efac'
};

export const PIECE_COLORS = {
  RED: '#ef4444',
  RED_LIGHT: '#fca5a5',
  BLACK: '#1f2937',
  BLACK_LIGHT: '#6b7280'
};

export const createInitialBoard = () => {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          color: PLAYER_COLORS.BLACK,
          type: PIECE_TYPES.NORMAL
        };
      }
    }
  }

  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          color: PLAYER_COLORS.RED,
          type: PIECE_TYPES.NORMAL
        };
      }
    }
  }

  return board;
};
