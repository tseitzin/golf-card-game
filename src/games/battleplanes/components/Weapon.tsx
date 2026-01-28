import React from 'react';
import { Zap } from 'lucide-react';

interface WeaponProps {
  recharging: boolean;
  lightningActive: boolean;
  rechargeProgress: number;
}

export default function Weapon({ recharging, lightningActive, rechargeProgress }: WeaponProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20">
      {lightningActive && (
        <div className="absolute bottom-[160px] left-1/2 -translate-x-1/2">
          <svg width="80" height="600" viewBox="0 0 80 600" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))' }}>
            <defs>
              <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <path
              d="M 40 0 L 35 100 L 45 100 L 38 200 L 50 200 L 42 300 L 52 300 L 44 400 L 55 400 L 40 550 L 35 400 L 25 400 L 32 300 L 22 300 L 30 200 L 20 200 L 28 100 L 18 100 Z"
              fill="url(#lightningGradient)"
              filter="url(#glow)"
              className="animate-pulse"
              style={{ animationDuration: '150ms' }}
            />

            <path
              d="M 40 0 L 35 100 L 45 100 L 38 200 L 50 200 L 42 300 L 52 300 L 44 400 L 55 400 L 40 550"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
              className="animate-pulse"
              style={{ animationDuration: '100ms' }}
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
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32">
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

        {!recharging && !lightningActive && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-green-400 text-sm font-bold bg-slate-800 px-3 py-1 rounded-full border border-green-500 shadow-lg animate-pulse">
            READY
          </div>
        )}
      </div>

      <div className="w-24 h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t-2 border-slate-600"></div>
    </div>
  );
}
