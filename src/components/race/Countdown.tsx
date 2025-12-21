import { useEffect, useState } from 'react';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [count, onComplete]);

  const display = count > 0 ? count.toString() : 'GO!';
  const color = count > 0 ? '#FFFFFF' : '#4ADE80';

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
      <div
        className="text-9xl font-black animate-pulse drop-shadow-2xl"
        style={{
          color,
          textShadow: `0 0 60px ${color}, 0 0 100px ${color}`,
          animation: 'countdownPop 0.5s ease-out',
        }}
      >
        {display}
      </div>
      <style>{`
        @keyframes countdownPop {
          0% {
            transform: scale(2);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
