import { Bot } from 'lucide-react';
import type { Robot } from '../types';

interface RobotComponentProps {
  robot: Robot;
}

export default function RobotComponent({ robot }: RobotComponentProps) {
  const rotation = Math.atan2(robot.velocity.y, robot.velocity.x) * (180 / Math.PI);

  return (
    <div
      className="absolute transition-transform"
      style={{
        left: `${robot.position.x}px`,
        top: `${robot.position.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      <div className="relative animate-pulse">
        <Bot className="w-14 h-14 text-red-600 drop-shadow-lg" />
        <div className="absolute inset-0 bg-red-500 opacity-30 rounded-full blur-md"></div>
      </div>
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-bold text-white bg-red-600 bg-opacity-80 px-2 py-1 rounded">
          Evil Robot
        </span>
      </div>
    </div>
  );
}
