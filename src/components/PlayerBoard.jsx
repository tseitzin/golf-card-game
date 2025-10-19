import Card from './Card.jsx'
import { useRef, useEffect } from 'react'

export default function PlayerBoard({
  index,
  player,
  name,
  color,
  isComputer,
  runningTotal,
  canInteractWithCard,
  onCardClick,
}) {
  // Track previous faceUp states to apply small stagger only to the two most recently flipped cards at start.
  const prevFaceUpRef = useRef([])
  useEffect(() => {
    prevFaceUpRef.current = player?.cards?.map(c => c.faceUp) || []
  }, [player])

  return (
    <div
      style={{
        flex: '0 1 220px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          color: color,
          fontWeight: 'bold',
          fontSize: 16,
          textAlign: 'center',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontWeight: '600',
          color: '#222',
          textAlign: 'center',
          fontSize: 13,
        }}
      >
        Running Total: {runningTotal}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 52px)',
          gridTemplateRows: 'repeat(2, 78px)',
          gap: '8px',
          background: color,
          borderRadius: 10,
          padding: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {(player?.cards || Array(8).fill(null)).map((card, idxCard) => {
          const isInteractive = card ? canInteractWithCard(index, idxCard) : false
          // Stagger flips slightly for computer-controlled seats when cards auto-reveal.
          let flipDelay = 0
          const prev = prevFaceUpRef.current[idxCard]
          if (isComputer && card?.faceUp && prev === false) {
            // Stagger based on how many other newly flipped in this pass (simple idx weighting)
            flipDelay = (idxCard % 4) * 40
          }
          return (
            <Card
              key={card ? card.id : idxCard}
              card={card}
              interactive={isInteractive}
              onClick={() => onCardClick?.(index, idxCard)}
              flipDelay={flipDelay}
            />
          )
        })}
      </div>
    </div>
  )
}

