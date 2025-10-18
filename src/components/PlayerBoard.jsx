export default function PlayerBoard({
  index,
  player,
  name,
  color,
  runningTotal,
  canInteractWithCard,
  onCardClick,
}) {
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
          return (
            <div
              key={card ? card.id : idxCard}
              style={{
                width: '60px',
                height: '90px',
                background: card?.faceUp ? '#eee' : '#333',
                color: card?.faceUp ? '#222' : '#eee',
                border: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: isInteractive ? 'pointer' : 'default',
              }}
              onClick={() => onCardClick?.(index, idxCard)}
            >
              {card?.faceUp ? card.value : '?'}
            </div>
          )
        })}
      </div>
    </div>
  )
}
