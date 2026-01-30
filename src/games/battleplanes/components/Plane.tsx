import React from 'react';
import type { Plane as PlaneType } from '../types';
import planeImage from '../../../assets/plane.png';

interface PlaneProps {
  plane: PlaneType;
}

export default function Plane({ plane }: PlaneProps) {
  const { x, y, direction, number, width, height } = plane;
  // PNG image faces left, so flip when going right
  const isFlipped = direction === 'right';

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
      <div className="relative w-full h-full">
        <img
          src={planeImage}
          alt={`Plane ${number}`}
          className={`w-full h-full object-contain ${isFlipped ? 'scale-x-[-1]' : ''}`}
        />
        <span
          className="absolute text-white font-bold text-xs"
          style={{
            top: '50%',
            left: isFlipped ? '25%' : '75%',
            transform: 'translate(-50%, -50%)',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
          }}
        >
          {number}
        </span>
      </div>
    </div>
  );
}
