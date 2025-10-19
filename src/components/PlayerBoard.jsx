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
    <div>
      <div
        style={{
          color: color,
          fontWeight: 'bold',
          marginBottom: 4,
          fontSize: 18,
          textAlign: 'center',
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginBottom: 6,
          fontWeight: 'bold',
          color: '#222',
          textAlign: 'center',
        }}
      >
        Running Total: {runningTotal}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 60px)',
          gridTemplateRows: 'repeat(2, 90px)',
          gap: '10px',
          background: color,
          borderRadius: 12,
          padding: 12,
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

