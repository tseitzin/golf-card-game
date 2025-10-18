export default function ActionBar({ onReset, onEndRound, onNextHole, roundOver, currentHole, onClearSave }) {
  return (
    <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
      <button
        style={{
          background: '#FFD600',
          color: '#14532D',
          fontWeight: 'bold',
          padding: '12px 32px',
          borderRadius: '999px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={onReset}
      >
        Reset
      </button>
      <button
        style={{
          background: '#dc2626',
          color: '#fff',
          fontWeight: 'bold',
          padding: '12px 32px',
          borderRadius: '999px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={onClearSave}
      >
        Clear Save
      </button>
      <button
        style={{
          background: '#14532D',
          color: '#FFD600',
          fontWeight: 'bold',
          padding: '12px 32px',
          borderRadius: '999px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={onEndRound}
      >
        End Round
      </button>
      {roundOver && currentHole < 9 && (
        <button
          style={{
            background: '#0d9488',
            color: '#fff',
            fontWeight: 'bold',
            padding: '12px 32px',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={onNextHole}
        >
          Next Hole
        </button>
      )}
    </div>
  )
}
