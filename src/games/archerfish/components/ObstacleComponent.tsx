import type { Obstacle } from '../types';
import icebergImg from '../assets/iceberg.png';

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
              <defs>
                <linearGradient id="seaweedGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a0e" />
                  <stop offset="50%" stopColor="#2d5016" />
                  <stop offset="100%" stopColor="#4d7c28" />
                </linearGradient>
                <linearGradient id="seaweedGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#2d5016" />
                  <stop offset="50%" stopColor="#3d6b1f" />
                  <stop offset="100%" stopColor="#5d8c38" />
                </linearGradient>
                <linearGradient id="seaweedGradient3" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a0e" />
                  <stop offset="50%" stopColor="#2d5016" />
                  <stop offset="100%" stopColor="#4d7c28" />
                </linearGradient>
              </defs>
              
              {/* Back frond (left, darkest) */}
              <path
                d="M 12,100 Q 8,90 10,80 Q 12,70 8,60 Q 6,50 10,40 Q 12,30 8,20 Q 6,10 10,5 Q 11,2 12,0"
                fill="none"
                stroke="url(#seaweedGradient1)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Left frond leaves */}
              <ellipse cx="7" cy="25" rx="3" ry="7" fill="#2d5016" opacity="0.7" transform="rotate(-25 7 25)" />
              <ellipse cx="11" cy="45" rx="3.5" ry="8" fill="#3d6b1f" opacity="0.7" transform="rotate(20 11 45)" />
              <ellipse cx="8" cy="65" rx="3" ry="6" fill="#2d5016" opacity="0.7" transform="rotate(-20 8 65)" />
              <ellipse cx="10" cy="85" rx="3.5" ry="7" fill="#3d6b1f" opacity="0.7" transform="rotate(15 10 85)" />
              
              {/* Middle frond (center, brightest) */}
              <path
                d="M 30,100 Q 26,90 28,80 Q 30,70 26,60 Q 25,50 28,40 Q 30,30 27,20 Q 26,10 28,5 Q 29,2 30,0"
                fill="none"
                stroke="url(#seaweedGradient2)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Center frond leaves */}
              <ellipse cx="24" cy="22" rx="4" ry="9" fill="#4d7c28" opacity="0.8" transform="rotate(-30 24 22)" />
              <ellipse cx="31" cy="35" rx="4.5" ry="10" fill="#5d8c38" opacity="0.8" transform="rotate(25 31 35)" />
              <ellipse cx="25" cy="50" rx="4" ry="9" fill="#4d7c28" opacity="0.8" transform="rotate(-25 25 50)" />
              <ellipse cx="32" cy="65" rx="4.5" ry="10" fill="#5d8c38" opacity="0.8" transform="rotate(20 32 65)" />
              <ellipse cx="27" cy="80" rx="4" ry="8" fill="#4d7c28" opacity="0.8" transform="rotate(-20 27 80)" />
              
              {/* Front frond (right) */}
              <path
                d="M 48,100 Q 44,90 46,80 Q 48,70 44,60 Q 43,50 46,40 Q 48,30 45,20 Q 44,10 46,5 Q 47,2 48,0"
                fill="none"
                stroke="url(#seaweedGradient3)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Right frond leaves */}
              <ellipse cx="50" cy="28" rx="3" ry="7" fill="#3d6b1f" opacity="0.7" transform="rotate(25 50 28)" />
              <ellipse cx="45" cy="48" rx="3.5" ry="8" fill="#4d7c28" opacity="0.7" transform="rotate(-20 45 48)" />
              <ellipse cx="49" cy="68" rx="3" ry="6" fill="#3d6b1f" opacity="0.7" transform="rotate(20 49 68)" />
              <ellipse cx="46" cy="88" rx="3.5" ry="7" fill="#4d7c28" opacity="0.7" transform="rotate(-15 46 88)" />
              
              {/* Highlights on fronds */}
              <ellipse cx="28" cy="15" rx="1.5" ry="4" fill="#7dd957" opacity="0.6" />
              <ellipse cx="29" cy="40" rx="1.5" ry="4" fill="#7dd957" opacity="0.5" transform="rotate(15 29 40)" />
              <ellipse cx="28" cy="70" rx="1.5" ry="3" fill="#7dd957" opacity="0.5" transform="rotate(-10 28 70)" />
              
              {/* Small bubbles around seaweed */}
              <circle cx="18" cy="35" r="2" fill="#bae6fd" opacity="0.5" />
              <circle cx="40" cy="45" r="1.5" fill="#bae6fd" opacity="0.6" />
              <circle cx="22" cy="60" r="1.8" fill="#bae6fd" opacity="0.5" />
              <circle cx="38" cy="75" r="1.5" fill="#bae6fd" opacity="0.6" />
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
              <defs>
                <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f4e4c1" />
                  <stop offset="50%" stopColor="#e6d5a8" />
                  <stop offset="100%" stopColor="#d4b896" />
                </linearGradient>
                <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6d4c2a" />
                  <stop offset="50%" stopColor="#8b5a3c" />
                  <stop offset="100%" stopColor="#6d4c2a" />
                </linearGradient>
                <radialGradient id="rockGradient">
                  <stop offset="0%" stopColor="#a89080" />
                  <stop offset="100%" stopColor="#7a6555" />
                </radialGradient>
              </defs>
              
              {/* Water edge/shadow */}
              <ellipse cx="60" cy="62" rx="58" ry="18" fill="#0ea5e9" opacity="0.2" />
              
              {/* Main sand island base */}
              <ellipse cx="60" cy="58" rx="55" ry="16" fill="url(#sandGradient)" />
              
              {/* Sand texture details */}
              <ellipse cx="60" cy="56" rx="52" ry="14" fill="#f8eed6" />
              <ellipse cx="35" cy="58" rx="8" ry="3" fill="#ddc9a3" opacity="0.4" />
              <ellipse cx="80" cy="59" rx="10" ry="3" fill="#ddc9a3" opacity="0.4" />
              
              {/* Rocks on beach */}
              <ellipse cx="25" cy="58" rx="5" ry="4" fill="url(#rockGradient)" />
              <ellipse cx="28" cy="60" rx="3" ry="2.5" fill="url(#rockGradient)" />
              <ellipse cx="88" cy="59" rx="4" ry="3" fill="url(#rockGradient)" />
              
              {/* Palm tree trunk */}
              <path
                d="M 58,55 Q 56,45 57,35 Q 58,25 56,15"
                fill="none"
                stroke="url(#trunkGradient)"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              
              {/* Trunk segments/texture */}
              <ellipse cx="57" cy="48" rx="2.5" ry="1.5" fill="#5a3d25" opacity="0.6" />
              <ellipse cx="57" cy="40" rx="2.5" ry="1.5" fill="#5a3d25" opacity="0.6" />
              <ellipse cx="56" cy="32" rx="2.5" ry="1.5" fill="#5a3d25" opacity="0.6" />
              <ellipse cx="56" cy="24" rx="2.5" ry="1.5" fill="#5a3d25" opacity="0.6" />
              
              {/* Palm fronds (back layer) */}
              <ellipse cx="40" cy="14" rx="18" ry="6" fill="#2d5016" opacity="0.7" transform="rotate(-35 40 14)" />
              <ellipse cx="75" cy="16" rx="18" ry="6" fill="#2d5016" opacity="0.7" transform="rotate(35 75 16)" />
              
              {/* Palm fronds (middle layer) */}
              <ellipse cx="38" cy="10" rx="20" ry="7" fill="#3d7c1f" transform="rotate(-25 38 10)" />
              <ellipse cx="78" cy="12" rx="20" ry="7" fill="#3d7c1f" transform="rotate(25 78 12)" />
              <ellipse cx="56" cy="5" rx="22" ry="7" fill="#3d7c1f" transform="rotate(-5 56 5)" />
              
              {/* Palm fronds (front layer - brightest) */}
              <ellipse cx="42" cy="8" rx="19" ry="6.5" fill="#4d9c28" transform="rotate(-20 42 8)" />
              <ellipse cx="72" cy="10" rx="19" ry="6.5" fill="#4d9c28" transform="rotate(20 72 10)" />
              <ellipse cx="57" cy="4" rx="20" ry="6.5" fill="#5db838" />
              
              {/* Frond highlights */}
              <ellipse cx="57" cy="3" rx="12" ry="2" fill="#7dd957" opacity="0.6" />
              <ellipse cx="45" cy="7" rx="10" ry="2" fill="#7dd957" opacity="0.5" transform="rotate(-20 45 7)" />
              <ellipse cx="70" cy="9" rx="10" ry="2" fill="#7dd957" opacity="0.5" transform="rotate(20 70 9)" />
              
              {/* Coconuts */}
              <circle cx="54" cy="16" r="3" fill="#8b6f47" />
              <circle cx="58" cy="17" r="3" fill="#a0855a" />
              <circle cx="56" cy="14" r="2.5" fill="#6d5639" />
              
              {/* Small shells on beach */}
              <ellipse cx="70" cy="60" rx="2" ry="1.5" fill="#fff" opacity="0.8" />
              <ellipse cx="72" cy="59" rx="1.5" ry="1" fill="#ffe4e1" opacity="0.7" />
              <ellipse cx="40" cy="60" rx="1.5" ry="1" fill="#fff" opacity="0.7" />
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
            <img 
              src={icebergImg} 
              alt="iceberg"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            />
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
                <radialGradient id="coralPink">
                  <stop offset="0%" stopColor="#ff8fab" />
                  <stop offset="100%" stopColor="#ff6b9d" />
                </radialGradient>
                <radialGradient id="coralOrange">
                  <stop offset="0%" stopColor="#ffb399" />
                  <stop offset="100%" stopColor="#ff8c69" />
                </radialGradient>
                <radialGradient id="coralPurple">
                  <stop offset="0%" stopColor="#d8b4fe" />
                  <stop offset="100%" stopColor="#c084fc" />
                </radialGradient>
                <linearGradient id="coralBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b7355" />
                  <stop offset="100%" stopColor="#6d5839" />
                </linearGradient>
              </defs>
              
              {/* Rock/sand base */}
              <ellipse cx="40" cy="95" rx="35" ry="8" fill="url(#coralBaseGradient)" opacity="0.7" />
              <ellipse cx="40" cy="93" rx="32" ry="6" fill="#a89080" opacity="0.5" />
              
              {/* Left coral branch (pink) */}
              <path
                d="M 18,95 Q 16,85 18,75 Q 20,65 18,55 Q 17,45 19,35 Q 20,25 18,18"
                fill="none"
                stroke="url(#coralPink)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Left branch tips */}
              <circle cx="14" cy="35" r="5" fill="url(#coralPink)" />
              <circle cx="22" cy="40" r="4.5" fill="url(#coralPink)" />
              <circle cx="15" cy="55" r="4" fill="url(#coralPink)" />
              <circle cx="21" cy="60" r="4.5" fill="url(#coralPink)" />
              <circle cx="16" cy="75" r="4" fill="url(#coralPink)" />
              <circle cx="18" cy="18" r="5.5" fill="url(#coralPink)" />
              
              {/* Center coral branch (orange, tallest) */}
              <path
                d="M 40,95 Q 38,85 40,75 Q 42,65 40,55 Q 39,45 41,35 Q 42,25 40,15 Q 39,8 40,5"
                fill="none"
                stroke="url(#coralOrange)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Center branch tips */}
              <circle cx="36" cy="30" r="5.5" fill="url(#coralOrange)" />
              <circle cx="44" cy="35" r="5" fill="url(#coralOrange)" />
              <circle cx="37" cy="50" r="4.5" fill="url(#coralOrange)" />
              <circle cx="43" cy="55" r="5" fill="url(#coralOrange)" />
              <circle cx="38" cy="70" r="4.5" fill="url(#coralOrange)" />
              <circle cx="42" cy="75" r="4" fill="url(#coralOrange)" />
              <circle cx="40" cy="5" r="6" fill="url(#coralOrange)" />
              <circle cx="38" cy="12" r="4" fill="url(#coralOrange)" />
              <circle cx="42" cy="18" r="4.5" fill="url(#coralOrange)" />
              
              {/* Right coral branch (purple) */}
              <path
                d="M 62,95 Q 64,85 62,75 Q 60,65 62,55 Q 63,45 61,35 Q 60,25 62,18"
                fill="none"
                stroke="url(#coralPurple)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Right branch tips */}
              <circle cx="66" cy="35" r="5" fill="url(#coralPurple)" />
              <circle cx="58" cy="40" r="4.5" fill="url(#coralPurple)" />
              <circle cx="65" cy="55" r="4" fill="url(#coralPurple)" />
              <circle cx="59" cy="60" r="4.5" fill="url(#coralPurple)" />
              <circle cx="64" cy="75" r="4" fill="url(#coralPurple)" />
              <circle cx="62" cy="18" r="5.5" fill="url(#coralPurple)" />
              
              {/* Polyp details (small dots) */}
              <circle cx="18" cy="22" r="1.5" fill="#fff" opacity="0.8" />
              <circle cx="17" cy="45" r="1.3" fill="#fff" opacity="0.7" />
              <circle cx="19" cy="65" r="1.4" fill="#fff" opacity="0.8" />
              
              <circle cx="40" cy="8" r="1.5" fill="#fff" opacity="0.8" />
              <circle cx="39" cy="25" r="1.4" fill="#fff" opacity="0.8" />
              <circle cx="41" cy="45" r="1.3" fill="#fff" opacity="0.7" />
              <circle cx="40" cy="65" r="1.5" fill="#fff" opacity="0.8" />
              
              <circle cx="62" cy="22" r="1.5" fill="#fff" opacity="0.8" />
              <circle cx="63" cy="45" r="1.3" fill="#fff" opacity="0.7" />
              <circle cx="61" cy="65" r="1.4" fill="#fff" opacity="0.8" />
              
              {/* Highlights on branch tips */}
              <circle cx="18" cy="17" r="2" fill="#fff" opacity="0.4" />
              <circle cx="40" cy="4" r="2.5" fill="#fff" opacity="0.4" />
              <circle cx="62" cy="17" r="2" fill="#fff" opacity="0.4" />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderObstacle()}</>;
}
