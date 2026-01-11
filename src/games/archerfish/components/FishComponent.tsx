import { Fish as FishIcon, Snowflake } from 'lucide-react';
import type { Fish } from '../types';

interface FishComponentProps {
  fish: Fish;
}

export default function FishComponent({ fish }: FishComponentProps) {
  const rotation = Math.atan2(fish.velocity.y, fish.velocity.x) * (180 / Math.PI);

  return (
    <div
      className="absolute transition-transform"
      style={{
        left: `${fish.position.x}px`,
        top: `${fish.position.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      <div className="relative">
        <FishIcon
          className={`w-12 h-12 drop-shadow-lg ${
            fish.isFrozen ? 'text-blue-200' : ''
          }`}
          style={{ color: fish.isFrozen ? '#bfdbfe' : fish.color }}
        />
        {fish.isFrozen && (
          <Snowflake className="w-6 h-6 text-blue-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        )}
      </div>
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {fish.name}
        </span>
      </div>
    </div>
  );
}
