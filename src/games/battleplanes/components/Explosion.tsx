import React, { useEffect, useState } from 'react';

interface ExplosionProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export default function Explosion({ x, y, onComplete }: ExplosionProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  const lineCount = 8;
  const lineLength = 14;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {Array.from({ length: lineCount }).map((_, i) => {
        const angle = (i * 360) / lineCount;
        const opacity = 1 - progress;

        return (
          <div
            key={i}
            className="absolute bg-red-600"
            style={{
              width: '3px',
              height: `${lineLength}px`,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              transformOrigin: 'center bottom',
              opacity: opacity,
            }}
          />
        );
      })}
    </div>
  );
}
