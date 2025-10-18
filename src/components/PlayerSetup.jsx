export default function PlayerSetup({ playerSetup, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>Player Setup</h2>
      {[0, 1].map(idx => (
        <div key={idx} style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
            Player {idx + 1} Name:
          </label>
          <input
            type="text"
            value={playerSetup[idx].name}
            onChange={e => onChange(idx, 'name', e.target.value)}
            required
            style={{
              padding: 8,
              borderRadius: 6,
              border: '1px solid #ccc',
              marginBottom: 8,
              width: 180,
            }}
          />
          <div style={{ marginTop: 6 }}>
            <label style={{ fontWeight: 'bold', marginRight: 8 }}>Color:</label>
            <input
              type="color"
              value={playerSetup[idx].color}
              onChange={e => onChange(idx, 'color', e.target.value)}
              style={{
                width: 36,
                height: 36,
                border: 'none',
                background: 'none',
                verticalAlign: 'middle',
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="submit"
        style={{
          background: '#22c55e',
          color: '#fff',
          fontWeight: 'bold',
          padding: '10px 32px',
          borderRadius: 8,
          border: 'none',
          fontSize: 18,
          marginTop: 12,
          cursor: 'pointer',
        }}
      >
        Start Game
      </button>
    </form>
  )
}
