import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { PLAYER_COLORS, PIECE_TYPES, PIECE_COLORS } from '../constants';

const CheckerPiece = ({ piece, isSelected, isDragging }) => {
  if (!piece) return null;

  const isRed = piece.color === PLAYER_COLORS.RED;
  const isKing = piece.type === PIECE_TYPES.KING;

  const pieceColor = isRed ? PIECE_COLORS.RED : PIECE_COLORS.BLACK;
  const pieceLightColor = isRed ? PIECE_COLORS.RED_LIGHT : PIECE_COLORS.BLACK_LIGHT;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: isSelected ? 1.1 : 1,
        y: isDragging ? -10 : 0
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className="relative w-full h-full flex items-center justify-center pointer-events-none"
    >
      <motion.div
        className="relative rounded-full shadow-lg flex items-center justify-center cursor-pointer"
        style={{
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle at 30% 30%, ${pieceLightColor}, ${pieceColor})`,
          border: isSelected ? '3px solid #fbbf24' : '2px solid rgba(0,0,0,0.2)',
          boxShadow: isSelected
            ? '0 8px 16px rgba(0,0,0,0.3), 0 0 20px rgba(251, 191, 36, 0.5)'
            : '0 4px 8px rgba(0,0,0,0.2)'
        }}
        whileHover={{ scale: 1.05 }}
      >
        {isKing && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
          >
            <Crown
              className="text-yellow-300"
              size={24}
              strokeWidth={2.5}
              fill="#fde047"
            />
          </motion.div>
        )}
      </motion.div>

      {isKing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(253, 224, 71, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.div>
  );
};

export default CheckerPiece;
