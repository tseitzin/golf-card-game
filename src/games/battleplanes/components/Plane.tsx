import React from 'react';
import type { Plane as PlaneType } from '../types';

interface PlaneProps {
  plane: PlaneType;
}

export default function Plane({ plane }: PlaneProps) {
  const { x, y, direction, variety, number, width, height } = plane;
  const isFlipped = direction === 'left';

  // When the SVG is flipped, we need to counter-flip the text and adjust its position
  const textTransform = isFlipped ? 'scale(-1, 1) translate(-20, 0)' : '';

  const renderPlane = () => {
    switch (variety) {
      case 1:
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 40"
            className={isFlipped ? 'scale-x-[-1]' : ''}
          >
            <defs>
              <linearGradient id={`grad1-${plane.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#475569', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#334155', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 98 20 L 92 19 L 85 18 L 78 17.5 L 68 17 L 58 16 L 50 14 L 42 12 L 35 13 L 28 15 L 22 17 L 15 18 L 8 19 L 3 20 L 8 21 L 15 22 L 22 23 L 28 25 L 35 27 L 42 28 L 50 26 L 58 24 L 68 23 L 78 22.5 L 85 22 L 92 21 L 98 20 Z"
              fill={`url(#grad1-${plane.id})`}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <path d="M 58 5 L 65 16 L 58 17 L 51 16 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
            <path d="M 58 35 L 65 24 L 58 23 L 51 24 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
            <path d="M 38 10 L 42 16 L 38 17 L 34 16 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
            <path d="M 38 30 L 42 24 L 38 23 L 34 24 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
            <path d="M 8 14 L 14 18 L 14 22 L 8 26 L 6 20 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <ellipse cx="25" cy="20" rx="6" ry="4" fill="#0f172a" opacity="0.8" />
            <path d="M 85 18 L 92 19 L 92 21 L 85 22 Z" fill="#1e293b" />
            <circle cx="90" cy="20" r="2.5" fill="#ef4444" opacity="0.9" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="13"
              fontWeight="bold"
              stroke="#000"
              strokeWidth="0.5"
              transform={textTransform}
            >
              {number}
            </text>
          </svg>
        );
      case 2:
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 40"
            className={isFlipped ? 'scale-x-[-1]' : ''}
          >
            <defs>
              <linearGradient id={`grad2-${plane.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#71717a', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#52525b', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#3f3f46', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 97 20 L 90 18.5 L 82 17.5 L 72 16.5 L 62 15.5 L 52 13.5 L 44 11 L 36 10 L 28 12 L 20 15 L 13 17.5 L 6 19 L 2 20 L 6 21 L 13 22.5 L 20 25 L 28 28 L 36 30 L 44 29 L 52 26.5 L 62 24.5 L 72 23.5 L 82 22.5 L 90 21.5 L 97 20 Z"
              fill={`url(#grad2-${plane.id})`}
              stroke="#27272a"
              strokeWidth="1.5"
            />
            <path d="M 62 4 L 68 15.5 L 62 16.5 L 56 15.5 Z" fill="#52525b" stroke="#27272a" strokeWidth="1" />
            <path d="M 62 36 L 68 24.5 L 62 23.5 L 56 24.5 Z" fill="#52525b" stroke="#27272a" strokeWidth="1" />
            <path d="M 44 8 L 48 15 L 44 16 L 40 15 Z" fill="#52525b" stroke="#27272a" strokeWidth="1" />
            <path d="M 44 32 L 48 25 L 44 24 L 40 25 Z" fill="#52525b" stroke="#27272a" strokeWidth="1" />
            <path d="M 28 9 L 32 16 L 28 17 L 24 16 Z" fill="#52525b" stroke="#27272a" strokeWidth="0.8" />
            <path d="M 28 31 L 32 24 L 28 23 L 24 24 Z" fill="#52525b" stroke="#27272a" strokeWidth="0.8" />
            <path d="M 6 15 L 11 18 L 11 22 L 6 25 L 4 20 Z" fill="#3f3f46" stroke="#27272a" strokeWidth="1" />
            <rect x="18" y="18.5" width="8" height="3" fill="#18181b" opacity="0.7" />
            <path d="M 82 17.5 L 90 18.5 L 90 21.5 L 82 22.5 Z" fill="#27272a" />
            <circle cx="88" cy="20" r="2.5" fill="#3b82f6" opacity="0.9" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="13"
              fontWeight="bold"
              stroke="#000"
              strokeWidth="0.5"
              transform={textTransform}
            >
              {number}
            </text>
          </svg>
        );
      case 3:
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 40"
            className={isFlipped ? 'scale-x-[-1]' : ''}
          >
            <defs>
              <linearGradient id={`grad3-${plane.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#78716c', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#57534e', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#44403c', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 96 20 L 88 18 L 78 16.5 L 68 15 L 58 13 L 48 10 L 38 8 L 30 9 L 22 12 L 15 15 L 9 17.5 L 4 19.5 L 2 20 L 4 20.5 L 9 22.5 L 15 25 L 22 28 L 30 31 L 38 32 L 48 30 L 58 27 L 68 25 L 78 23.5 L 88 22 L 96 20 Z"
              fill={`url(#grad3-${plane.id})`}
              stroke="#292524"
              strokeWidth="1.5"
            />
            <path d="M 68 3 L 75 15 L 68 16 L 61 15 Z" fill="#57534e" stroke="#292524" strokeWidth="1" />
            <path d="M 68 37 L 75 25 L 68 24 L 61 25 Z" fill="#57534e" stroke="#292524" strokeWidth="1" />
            <path d="M 48 6 L 53 13 L 48 14 L 43 13 Z" fill="#57534e" stroke="#292524" strokeWidth="1" />
            <path d="M 48 34 L 53 27 L 48 26 L 43 27 Z" fill="#57534e" stroke="#292524" strokeWidth="1" />
            <path d="M 30 7 L 34 14 L 30 15 L 26 14 Z" fill="#57534e" stroke="#292524" strokeWidth="0.8" />
            <path d="M 30 33 L 34 26 L 30 25 L 26 26 Z" fill="#57534e" stroke="#292524" strokeWidth="0.8" />
            <path d="M 15 10 L 20 16 L 15 17 L 10 16 Z" fill="#57534e" stroke="#292524" strokeWidth="0.8" />
            <path d="M 15 30 L 20 24 L 15 23 L 10 24 Z" fill="#57534e" stroke="#292524" strokeWidth="0.8" />
            <path d="M 4 16 L 8 18 L 8 22 L 4 24 L 2 20 Z" fill="#44403c" stroke="#292524" strokeWidth="1" />
            <ellipse cx="22" cy="20" rx="5" ry="3.5" fill="#1c1917" opacity="0.8" />
            <path d="M 78 16.5 L 88 18 L 88 22 L 78 23.5 Z" fill="#292524" />
            <circle cx="86" cy="20" r="2.5" fill="#f59e0b" opacity="0.9" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="13"
              fontWeight="bold"
              stroke="#000"
              strokeWidth="0.5"
              transform={textTransform}
            >
              {number}
            </text>
          </svg>
        );
      case 4:
      default:
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 100 40"
            className={isFlipped ? 'scale-x-[-1]' : ''}
          >
            <defs>
              <linearGradient id={`grad4-${plane.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#6b7280', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#4b5563', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 97 20 L 89 18.5 L 80 17 L 70 15.5 L 60 13.5 L 50 11 L 40 9 L 32 10 L 24 13 L 17 16 L 11 18.5 L 5 19.5 L 2 20 L 5 20.5 L 11 21.5 L 17 24 L 24 27 L 32 30 L 40 31 L 50 29 L 60 26.5 L 70 24.5 L 80 23 L 89 21.5 L 97 20 Z"
              fill={`url(#grad4-${plane.id})`}
              stroke="#1f2937"
              strokeWidth="1.5"
            />
            <path d="M 70 4 L 76 15.5 L 70 16.5 L 64 15.5 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            <path d="M 70 36 L 76 24.5 L 70 23.5 L 64 24.5 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            <path d="M 50 7 L 55 13 L 50 14 L 45 13 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            <path d="M 50 33 L 55 27 L 50 26 L 45 27 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            <path d="M 32 8 L 36 15 L 32 16 L 28 15 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="0.8" />
            <path d="M 32 32 L 36 25 L 32 24 L 28 25 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="0.8" />
            <path d="M 5 15 L 10 18 L 10 22 L 5 25 L 3 20 Z" fill="#374151" stroke="#1f2937" strokeWidth="1" />
            <ellipse cx="20" cy="20" rx="5" ry="3.5" fill="#111827" opacity="0.8" />
            <rect x="14" y="18.5" width="6" height="3" fill="#0f172a" opacity="0.6" />
            <path d="M 80 17 L 89 18.5 L 89 21.5 L 80 23 Z" fill="#1f2937" />
            <circle cx="87" cy="20" r="2.5" fill="#10b981" opacity="0.9" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="13"
              fontWeight="bold"
              stroke="#000"
              strokeWidth="0.5"
              transform={textTransform}
            >
              {number}
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {renderPlane()}
    </div>
  );
}
