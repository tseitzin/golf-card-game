export default function DrawDiscardArea({
  drawnCard,
  discardTop,
  canDraw,
  canPickUp,
  canDiscard,
  onDraw,
  onPickUp,
  onDiscard,
}) {
  const drawPileClasses = [
    'card-transition-base',
    canDraw && !drawnCard ? 'draw-pile-ready' : null,
    drawnCard ? 'drawn-card-anim' : null,
  ].filter(Boolean).join(' ')
  const discardClasses = [
    'card-transition-base',
    canPickUp ? 'discard-pickup-anim' : null,
  ].filter(Boolean).join(' ')
  return (
    <div style={{ display: 'flex', gap: '24px', marginBottom: 0, justifyContent: 'center' }}>
      <div
        onClick={canDraw ? onDraw : undefined}
        style={{
          width: '60px',
          height: '90px',
          background: drawnCard ? '#FFD600' : '#333',
          color: drawnCard ? '#14532D' : '#eee',
          border: '2px solid #333',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '20px',
          cursor: canDraw ? 'pointer' : 'not-allowed',
        }}
        className={drawPileClasses}
      >
        {drawnCard ? drawnCard.value : '?'}
      </div>
      <div
        onClick={canPickUp ? onPickUp : undefined}
        style={{
          width: '60px',
          height: '90px',
          background: '#fff',
          color: '#14532D',
          border: '2px solid #14532D',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '20px',
          cursor: canPickUp ? 'pointer' : 'not-allowed',
        }}
        className={discardClasses}
      >
          {discardTop ? discardTop.value : '-'}
      </div>
      {drawnCard && (
        <button
          onClick={onDiscard}
          style={{
            marginLeft: 16,
            background: '#ef4444',
            color: '#fff',
            fontWeight: 'bold',
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            fontSize: 16,
            cursor: canDiscard ? 'pointer' : 'not-allowed',
          }}
          disabled={!canDiscard}
        >
          Discard Drawn
        </button>
      )}
    </div>
  )
}
