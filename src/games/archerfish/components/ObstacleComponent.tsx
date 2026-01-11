import type { Obstacle } from '../types';

interface ObstacleComponentProps {
  obstacle: Obstacle;
}

export default function ObstacleComponent({ obstacle }: ObstacleComponentProps) {
  const renderObstacle = () => {
    switch (obstacle.type) {
      case 'seaweed':
        return (
          <div
            className="absolute"
            style={{
              left: `${obstacle.position.x}px`,
              top: `${obstacle.position.y}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
            }}
          >
            <svg
              viewBox="0 0 60 100"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            >
              <path
                d="M15,100 Q10,70 15,50 Q20,30 15,10 Q13,0 15,0"
                fill="none"
                stroke="#2d5016"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M30,100 Q25,75 30,55 Q35,35 30,15 Q28,5 30,0"
                fill="none"
                stroke="#3d6b1f"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M45,100 Q40,70 45,50 Q50,30 45,10 Q43,0 45,0"
                fill="none"
                stroke="#2d5016"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <ellipse cx="18" cy="30" rx="4" ry="8" fill="#4d7c28" opacity="0.6" />
              <ellipse cx="25" cy="50" rx="5" ry="10" fill="#5d8c38" opacity="0.6" />
              <ellipse cx="35" cy="40" rx="4" ry="9" fill="#4d7c28" opacity="0.6" />
              <ellipse cx="42" cy="60" rx="4" ry="8" fill="#3d6b1f" opacity="0.6" />
            </svg>
          </div>
        );

      case 'island':
        return (
          <div
            className="absolute"
            style={{
              left: `${obstacle.position.x}px`,
              top: `${obstacle.position.y}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
            }}
          >
            <svg
              viewBox="0 0 120 80"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            >
              <ellipse cx="60" cy="55" rx="55" ry="25" fill="#c2923c" />
              <ellipse cx="60" cy="50" rx="50" ry="22" fill="#d4a54e" />
              <ellipse cx="40" cy="35" rx="12" ry="30" fill="#2d5016" />
              <ellipse cx="60" cy="30" rx="15" ry="35" fill="#3d6b1f" />
              <ellipse cx="80" cy="38" rx="10" ry="25" fill="#2d5016" />
              <ellipse cx="40" cy="28" rx="8" ry="12" fill="#4d7c28" />
              <ellipse cx="60" cy="23" rx="10" ry="15" fill="#5d8c38" />
              <ellipse cx="80" cy="32" rx="7" ry="10" fill="#4d7c28" />
              <circle cx="45" cy="25" r="3" fill="#8B4513" />
              <rect x="44" y="28" width="2" height="15" fill="#6d4c2a" />
            </svg>
          </div>
        );

      case 'iceberg':
        return (
          <div
            className="absolute"
            style={{
              left: `${obstacle.position.x}px`,
              top: `${obstacle.position.y}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}
            >
              <defs>
                <linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="50%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>
              </defs>
              <polygon
                points="50,5 85,60 75,70 60,90 40,90 25,70 15,60"
                fill="url(#iceGradient)"
                stroke="#7dd3fc"
                strokeWidth="2"
              />
              <polygon
                points="50,5 55,25 48,30 52,15"
                fill="#ffffff"
                opacity="0.6"
              />
              <polygon
                points="30,45 40,50 35,60 28,55"
                fill="#ffffff"
                opacity="0.4"
              />
              <polygon
                points="65,50 70,40 75,55 68,58"
                fill="#ffffff"
                opacity="0.5"
              />
            </svg>
          </div>
        );

      case 'coral':
        return (
          <div
            className="absolute"
            style={{
              left: `${obstacle.position.x}px`,
              top: `${obstacle.position.y}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
            }}
          >
            <svg
              viewBox="0 0 80 100"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            >
              <defs>
                <radialGradient id="coralGradient1">
                  <stop offset="0%" stopColor="#ff6b9d" />
                  <stop offset="100%" stopColor="#c41e3a" />
                </radialGradient>
                <radialGradient id="coralGradient2">
                  <stop offset="0%" stopColor="#ffa07a" />
                  <stop offset="100%" stopColor="#ff6347" />
                </radialGradient>
              </defs>
              <path
                d="M20,100 Q15,80 20,60 Q25,40 20,20 Q18,10 22,8 Q26,6 25,15 Q24,25 28,35 Q32,45 28,60 Q25,75 28,90 Q30,100 20,100"
                fill="url(#coralGradient1)"
              />
              <path
                d="M40,100 Q35,85 40,65 Q45,45 40,25 Q38,12 42,10 Q46,8 45,20 Q44,30 48,42 Q52,54 48,68 Q45,82 48,95 Q50,100 40,100"
                fill="url(#coralGradient2)"
              />
              <path
                d="M60,100 Q55,82 60,62 Q65,42 60,22 Q58,11 62,9 Q66,7 65,18 Q64,28 68,40 Q72,52 68,65 Q65,78 68,92 Q70,100 60,100"
                fill="url(#coralGradient1)"
              />
              <circle cx="22" cy="25" r="4" fill="#ff8fab" opacity="0.6" />
              <circle cx="42" cy="30" r="5" fill="#ffb399" opacity="0.6" />
              <circle cx="62" cy="28" r="4" fill="#ff8fab" opacity="0.6" />
              <circle cx="28" cy="50" r="3" fill="#ff8fab" opacity="0.5" />
              <circle cx="48" cy="55" r="4" fill="#ffb399" opacity="0.5" />
              <circle cx="68" cy="52" r="3" fill="#ff8fab" opacity="0.5" />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderObstacle()}</>;
}
