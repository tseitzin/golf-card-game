import { TrackType } from '../../types/race';

export interface TrackDefinition {
  type: TrackType;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  emoji: string;
}

export const TRACK_DEFINITIONS: Record<TrackType, TrackDefinition> = {
  [TrackType.Oval]: {
    type: TrackType.Oval,
    name: 'Classic Oval',
    description: 'Traditional NASCAR-style oval track',
    difficulty: 'Easy',
    emoji: '🏁',
  },
  [TrackType.Speedway]: {
    type: TrackType.Speedway,
    name: 'Super Speedway',
    description: 'Wide, high-speed oval with gentle banking',
    difficulty: 'Easy',
    emoji: '⚡',
  },
  [TrackType.Figure8]: {
    type: TrackType.Figure8,
    name: 'Figure Eight',
    description: 'Exciting crossover track with tight turns',
    difficulty: 'Medium',
    emoji: '🎯',
  },
  [TrackType.RoadCourse]: {
    type: TrackType.RoadCourse,
    name: 'Road Course',
    description: 'Winding track with multiple challenging corners',
    difficulty: 'Medium',
    emoji: '🛣️',
  },
};

export const TRACK_ORDER = [
  TrackType.Oval,
  TrackType.Speedway,
  TrackType.Figure8,
  TrackType.RoadCourse,
];
