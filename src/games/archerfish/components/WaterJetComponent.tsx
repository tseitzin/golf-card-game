import { Droplets } from 'lucide-react';
import type { WaterJet } from '../types';

interface WaterJetComponentProps {
  waterJet: WaterJet;
}

export default function WaterJetComponent({ waterJet }: WaterJetComponentProps) {
  const rotation = Math.atan2(waterJet.velocity.y, waterJet.velocity.x) * (180 / Math.PI);

  return (
    <div
      className="absolute transition-transform"
      style={{
        left: `${waterJet.position.x}px`,
        top: `${waterJet.position.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      <div className="relative">
        <Droplets
          className="w-8 h-8 text-cyan-400 drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))' }}
        />
        <div className="absolute inset-0 bg-cyan-400 opacity-40 rounded-full blur-sm"></div>
      </div>
    </div>
  );
}
