import { Fish as FishIcon, Snowflake } from 'lucide-react';
import type { Fish } from '../types';

interface FishComponentProps {
  fish: Fish;
}

export default function FishComponent({ fish }: FishComponentProps) {
  const rotation = Math.atan2(fish.velocity.y, fish.velocity.x) * (180 / Math.PI);
  const currentTime = Date.now();
  const cooldownRemaining = Math.max(0, fish.waterJetCooldown - (currentTime - fish.lastWaterJetTime));
  const cooldownPercent = (cooldownRemaining / fish.waterJetCooldown) * 100;
  const canShoot = cooldownRemaining === 0;

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
        {fish.isHuman && !fish.isFrozen && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-100"
              style={{ width: `${100 - cooldownPercent}%` }}
            ></div>
          </div>
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
