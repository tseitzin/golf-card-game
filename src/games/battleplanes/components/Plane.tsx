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
                <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 95 20 L 85 18 L 70 18 L 55 15 L 40 10 L 25 12 L 15 15 L 5 18 L 2 20 L 5 22 L 15 25 L 25 28 L 40 30 L 55 25 L 70 22 L 85 22 L 95 20 Z"
              fill={`url(#grad1-${plane.id})`}
              stroke="#334155"
              strokeWidth="1"
            />
            <path d="M 50 8 L 55 15 L 50 15 Z" fill="#475569" />
            <path d="M 50 32 L 55 25 L 50 25 Z" fill="#475569" />
            <ellipse cx="30" cy="20" rx="8" ry="5" fill="#1e293b" opacity="0.6" />
            <circle cx="85" cy="20" r="3" fill="#ef4444" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="14"
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
                <stop offset="100%" style={{ stopColor: '#52525b', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 95 20 L 88 19 L 75 19 L 60 17 L 45 14 L 30 16 L 20 18 L 8 19 L 3 20 L 8 21 L 20 22 L 30 24 L 45 26 L 60 23 L 75 21 L 88 21 L 95 20 Z"
              fill={`url(#grad2-${plane.id})`}
              stroke="#3f3f46"
              strokeWidth="1"
            />
            <path d="M 55 10 L 58 17 L 52 17 Z" fill="#52525b" />
            <path d="M 55 30 L 58 23 L 52 23 Z" fill="#52525b" />
            <path d="M 40 12 L 42 17 L 38 17 Z" fill="#52525b" />
            <path d="M 40 28 L 42 23 L 38 23 Z" fill="#52525b" />
            <rect x="28" y="18" width="10" height="4" fill="#27272a" opacity="0.6" />
            <circle cx="88" cy="20" r="3" fill="#3b82f6" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="14"
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
                <stop offset="100%" style={{ stopColor: '#57534e', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 95 20 L 87 18.5 L 72 18.5 L 58 16 L 43 13 L 28 15 L 18 17 L 6 18.5 L 2 20 L 6 21.5 L 18 23 L 28 25 L 43 27 L 58 24 L 72 21.5 L 87 21.5 L 95 20 Z"
              fill={`url(#grad3-${plane.id})`}
              stroke="#44403c"
              strokeWidth="1"
            />
            <path d="M 48 9 L 53 16 L 48 16 Z" fill="#57534e" />
            <path d="M 48 31 L 53 24 L 48 24 Z" fill="#57534e" />
            <ellipse cx="35" cy="20" rx="10" ry="6" fill="#292524" opacity="0.6" />
            <path d="M 20 14 L 22 18 L 18 18 Z" fill="#57534e" />
            <path d="M 20 26 L 22 22 L 18 22 Z" fill="#57534e" />
            <circle cx="87" cy="20" r="3" fill="#f59e0b" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="14"
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
                <stop offset="100%" style={{ stopColor: '#4b5563', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 96 20 L 90 18 L 77 18 L 63 15 L 48 11 L 33 13 L 22 16 L 10 18 L 4 20 L 10 22 L 22 24 L 33 27 L 48 29 L 63 25 L 77 22 L 90 22 L 96 20 Z"
              fill={`url(#grad4-${plane.id})`}
              stroke="#374151"
              strokeWidth="1"
            />
            <path d="M 52 7 L 57 15 L 52 15 Z" fill="#4b5563" />
            <path d="M 52 33 L 57 25 L 52 25 Z" fill="#4b5563" />
            <path d="M 38 9 L 41 16 L 35 16 Z" fill="#4b5563" />
            <path d="M 38 31 L 41 24 L 35 24 Z" fill="#4b5563" />
            <ellipse cx="25" cy="20" rx="7" ry="4" fill="#1f2937" opacity="0.7" />
            <rect x="15" y="18" width="8" height="4" fill="#111827" opacity="0.5" />
            <circle cx="90" cy="20" r="3" fill="#10b981" />
            <text
              x="10"
              y="24"
              textAnchor="middle"
              fill="white"
              fontSize="14"
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
