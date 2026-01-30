import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface WeaponProps {
  recharging: boolean;
  lightningActive: boolean;
  rechargeProgress: number;
}

export default function Weapon({ recharging, lightningActive, rechargeProgress }: WeaponProps) {
  const [lightningHeight, setLightningHeight] = useState(600);

  useEffect(() => {
    const updateLightningHeight = () => {
      const bottomOffset = 160;
      const height = window.innerHeight - bottomOffset;
      setLightningHeight(Math.max(height, 600));
    };

    updateLightningHeight();
    window.addEventListener('resize', updateLightningHeight);
    return () => window.removeEventListener('resize', updateLightningHeight);
  }, []);

  const scalePath = (path: string, originalHeight: number, newHeight: number) => {
    const scale = newHeight / originalHeight;
    return path.replace(/(\d+\.?\d*)/g, (match, number) => {
      const num = parseFloat(number);
      const isYCoordinate = path.indexOf(match) > 0 && path[path.indexOf(match) - 1] === ' ';
      return isYCoordinate ? (num * scale).toFixed(1) : match;
    });
  };

  const originalHeight = 600;
  const mainPath = scalePath(
    "M 25 0 L 23 85 L 30 85 L 26 145 L 32 145 L 28 210 L 34 210 L 29 275 L 36 275 L 31 340 L 38 340 L 33 405 L 40 405 L 34 470 L 42 470 L 25 550 L 26 460 L 20 460 L 24 395 L 18 395 L 22 330 L 15 330 L 20 265 L 14 265 L 19 200 L 13 200 L 18 135 L 12 135 L 17 85 L 10 85 Z",
    originalHeight,
    lightningHeight
  );
  const corePath = scalePath(
    "M 25 0 L 23 85 L 26 145 L 28 210 L 29 275 L 31 340 L 33 405 L 34 470 L 25 550",
    originalHeight,
    lightningHeight
  );
  const branch1 = scalePath("M 28 150 L 12 165 L 15 175", originalHeight, lightningHeight);
  const branch2 = scalePath("M 22 280 L 8 295 L 10 305", originalHeight, lightningHeight);
  const branch3 = scalePath("M 32 420 L 42 435 L 40 445", originalHeight, lightningHeight);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20">
      {lightningActive && (
        <div className="absolute bottom-[160px] left-1/2 -translate-x-1/2 -ml-[3px]">
          <svg width="50" height={lightningHeight} viewBox={`0 0 50 ${lightningHeight}`} className="animate-pulse" style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 30px rgba(147, 197, 253, 0.6))' }}>
            <defs>
              <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
                <stop offset="30%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="1" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.95" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="innerGlow">
                <feGaussianBlur stdDeviation="1" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Secondary branch effects */}
            <path
              d={branch1}
              stroke="url(#lightningGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
              filter="url(#glow)"
            />
            <path
              d={branch2}
              stroke="url(#lightningGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
              filter="url(#glow)"
            />
            <path
              d={branch3}
              stroke="url(#lightningGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
              filter="url(#glow)"
            />

            {/* Main lightning bolt - more jagged and realistic */}
            <path
              d={mainPath}
              fill="url(#lightningGradient)"
              filter="url(#glow)"
              className="animate-pulse"
              style={{ animationDuration: '120ms' }}
            />

            {/* Bright core highlight */}
            <path
              d={corePath}
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
              filter="url(#innerGlow)"
              className="animate-pulse"
              style={{ animationDuration: '80ms' }}
            />

            {/* Additional energy crackle */}
            <path
              d={corePath}
              stroke="#60a5fa"
              strokeWidth="4"
              fill="none"
              opacity="0.3"
              filter="url(#glow)"
            />
          </svg>

          <Zap className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 text-cyan-300 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))' }} />
        </div>
      )}

      <div className="relative w-20">
        <div className="w-full h-40 bg-slate-600 rounded-t-lg border-2 border-slate-700 shadow-xl relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap">
            <div className="text-white font-bold text-sm tracking-widest">
              BLOW UP
            </div>
          </div>
        </div>

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-lg flex items-center justify-center border-4 border-slate-700" style={{ marginLeft: '0' }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-transparent opacity-50"></div>
            {!recharging && (
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-40"></div>
            )}
          </div>
        </div>

        {recharging && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32">
            <div className="bg-slate-800 rounded-full p-2 border border-slate-600 shadow-lg">
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${rechargeProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-center text-cyan-300 mt-1 font-bold">
                RECHARGING
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="w-24 h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t-2 border-slate-600"></div>
    </div>
  );
}
