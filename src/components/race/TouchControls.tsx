import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerInputs } from '../../types/race';
import { CAR_COLORS } from '../../constants/race';

interface TouchControlsProps {
  playerCount: number;
  playerColors: string[];
  onInputChange: (inputs: PlayerInputs) => void;
  currentInputs: PlayerInputs;
}

const POSITIONS = [
  { top: 'auto', bottom: '20px', left: '20px', right: 'auto' },
  { top: 'auto', bottom: '20px', left: 'auto', right: '20px' },
  { top: '20px', bottom: 'auto', left: '20px', right: 'auto' },
  { top: '20px', bottom: 'auto', left: 'auto', right: '20px' },
];

export function TouchControls({
  playerCount,
  playerColors,
  onInputChange,
  currentInputs,
}: TouchControlsProps) {
  const handleTouchStart = (playerIndex: number, action: 'accelerate' | 'brake' | 'turnLeft' | 'turnRight') => {
    const newInputs = { ...currentInputs };
    if (!newInputs[playerIndex]) {
      newInputs[playerIndex] = { accelerate: false, brake: false, turnLeft: false, turnRight: false };
    }
    newInputs[playerIndex] = {
      ...newInputs[playerIndex],
      [action]: true,
    };
    onInputChange(newInputs);
  };

  const handleTouchEnd = (playerIndex: number, action: 'accelerate' | 'brake' | 'turnLeft' | 'turnRight') => {
    const newInputs = { ...currentInputs };
    if (!newInputs[playerIndex]) {
      newInputs[playerIndex] = { accelerate: false, brake: false, turnLeft: false, turnRight: false };
    }
    newInputs[playerIndex] = {
      ...newInputs[playerIndex],
      [action]: false,
    };
    onInputChange(newInputs);
  };

  const getColorName = (colorValue: string) => {
    const color = CAR_COLORS.find(c => c.value === colorValue);
    return color?.name || 'Unknown';
  };

  return (
    <>
      {Array.from({ length: playerCount }).map((_, index) => {
        const position = POSITIONS[index];
        const playerColor = playerColors[index] || '#888';
        const isAccelerating = currentInputs[index]?.accelerate || false;
        const isBraking = currentInputs[index]?.brake || false;
        const isTurningLeft = currentInputs[index]?.turnLeft || false;
        const isTurningRight = currentInputs[index]?.turnRight || false;

        return (
          <div
            key={index}
            className="fixed flex flex-col gap-2 z-50"
            style={{
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              right: position.right,
            }}
          >
            <div
              className="text-white text-xs font-bold px-2 py-1 rounded text-center"
              style={{ backgroundColor: playerColor }}
            >
              P{index + 1} - {getColorName(playerColor)}
            </div>
            <button
              className="w-16 h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 touch-none select-none"
              style={{
                backgroundColor: isAccelerating ? '#22c55e' : '#4ade80',
                boxShadow: isAccelerating
                  ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                  : '0 4px 6px rgba(0,0,0,0.3)',
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchStart(index, 'accelerate');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchEnd(index, 'accelerate');
              }}
              onMouseDown={() => handleTouchStart(index, 'accelerate')}
              onMouseUp={() => handleTouchEnd(index, 'accelerate')}
              onMouseLeave={() => handleTouchEnd(index, 'accelerate')}
            >
              <ChevronUp className="w-10 h-10 text-white" strokeWidth={3} />
            </button>
            <div className="flex gap-2">
              <button
                className="w-16 h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 touch-none select-none"
                style={{
                  backgroundColor: isTurningLeft ? '#1d4ed8' : '#60a5fa',
                  boxShadow: isTurningLeft
                    ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    : '0 4px 6px rgba(0,0,0,0.3)',
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleTouchStart(index, 'turnLeft');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleTouchEnd(index, 'turnLeft');
                }}
                onMouseDown={() => handleTouchStart(index, 'turnLeft')}
                onMouseUp={() => handleTouchEnd(index, 'turnLeft')}
                onMouseLeave={() => handleTouchEnd(index, 'turnLeft')}
              >
                <ChevronLeft className="w-10 h-10 text-white" strokeWidth={3} />
              </button>
              <button
                className="w-16 h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 touch-none select-none"
                style={{
                  backgroundColor: isTurningRight ? '#1d4ed8' : '#60a5fa',
                  boxShadow: isTurningRight
                    ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    : '0 4px 6px rgba(0,0,0,0.3)',
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleTouchStart(index, 'turnRight');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleTouchEnd(index, 'turnRight');
                }}
                onMouseDown={() => handleTouchStart(index, 'turnRight')}
                onMouseUp={() => handleTouchEnd(index, 'turnRight')}
                onMouseLeave={() => handleTouchEnd(index, 'turnRight')}
              >
                <ChevronRight className="w-10 h-10 text-white" strokeWidth={3} />
              </button>
            </div>
            <button
              className="w-16 h-16 rounded-xl flex items-center justify-center transition-transform active:scale-95 touch-none select-none"
              style={{
                backgroundColor: isBraking ? '#dc2626' : '#f87171',
                boxShadow: isBraking
                  ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                  : '0 4px 6px rgba(0,0,0,0.3)',
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchStart(index, 'brake');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTouchEnd(index, 'brake');
              }}
              onMouseDown={() => handleTouchStart(index, 'brake')}
              onMouseUp={() => handleTouchEnd(index, 'brake')}
              onMouseLeave={() => handleTouchEnd(index, 'brake')}
            >
              <ChevronDown className="w-10 h-10 text-white" strokeWidth={3} />
            </button>
          </div>
        );
      })}
    </>
  );
}
