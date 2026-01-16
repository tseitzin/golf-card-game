import type { Robot } from '../types';

interface RobotComponentProps {
  robot: Robot;
}

function EvilRobotIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
    >
      {/* Robot head/body */}
      <rect x="20" y="25" width="60" height="55" rx="8" fill="#dc2626" />
      <rect x="15" y="20" width="70" height="10" rx="5" fill="#991b1b" />
      {/* Antenna */}
      <line x1="50" y1="20" x2="50" y2="10" stroke="#991b1b" strokeWidth="3" />
      <circle cx="50" cy="8" r="4" fill="#fca5a5" />
      
      {/* Angry eyebrows - angled downward toward center, thicker and darker */}
      <line x1="28" y1="38" x2="42" y2="43" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="38" x2="58" y2="43" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
      
      {/* Evil glowing red eyes - larger and brighter */}
      <circle cx="35" cy="50" r="8" fill="#ff0000" />
      <circle cx="65" cy="50" r="8" fill="#ff0000" />
      {/* Eye glints - larger */}
      <circle cx="37" cy="48" r="3" fill="#ffffff" />
      <circle cx="67" cy="48" r="3" fill="#ffffff" />
      
      {/* Angry scowling mouth - thicker and more prominent */}
      <path d="M 30 68 Q 50 62 70 68" stroke="#000000" strokeWidth="5" fill="none" strokeLinecap="round" />
      
      {/* Rivets/bolts - larger */}
      <circle cx="25" cy="35" r="3" fill="#000000" />
      <circle cx="75" cy="35" r="3" fill="#000000" />
      <circle cx="25" cy="70" r="3" fill="#000000" />
      <circle cx="75" cy="70" r="3" fill="#000000" />
      
      {/* Arms */}
      <rect x="10" y="50" width="10" height="20" rx="3" fill="#991b1b" />
      <rect x="80" y="50" width="10" height="20" rx="3" fill="#991b1b" />
    </svg>
  );
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
      <div className="relative">
        <EvilRobotIcon className="w-16 h-16 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
      </div>
    </div>
  );
}
