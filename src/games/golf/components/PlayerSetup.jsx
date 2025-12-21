import PropTypes from 'prop-types'

export default function PlayerSetup({
  playerSetup,
  playerCount,
  onPlayerCountChange,
  onChange,
  onSubmit,
  setupError,
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.9)',
        backgroundImage: [
          'radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 55%)',
          'radial-gradient(circle at bottom right, rgba(56,189,248,0.16), transparent 50%)',
        ].join(', '),
        borderRadius: 20,
        padding: '36px 42px',
        marginBottom: 36,
        boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
        maxWidth: 780,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.6)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-140px -140px auto auto',
          width: 260,
          height: 260,
          background: 'radial-gradient(circle at center, rgba(250,204,21,0.45), transparent 65%)',
          opacity: 0.65,
          pointerEvents: 'none',
        }}
      />
      <h2 style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>Player Setup</h2>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <label style={{ fontWeight: 'bold', color: '#0f172a' }}>Number of Players (2–6):</label>
        <input
          type="number"
          min={2}
          max={6}
          value={playerCount}
          onChange={e => onPlayerCountChange?.(parseInt(e.target.value, 10) || 2)}
          style={{
            width: 90,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(148, 163, 184, 0.55)',
            fontWeight: 600,
            textAlign: 'center',
          }}
        />
        <span style={{ fontSize: 12, color: '#1f2937', opacity: 0.75 }}>At least one player must remain human.</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        {playerSetup.map((player, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              background: '#f8fafc',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#0f172a' }}>Player {idx + 1}</div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, color: '#1f2937' }}>Name</label>
            <input
              type="text"
              value={player.name}
              onChange={e => onChange(idx, 'name', e.target.value)}
              placeholder={player.isComputer ? `Computer ${idx + 1}` : `Player ${idx + 1}`}
              style={{
                padding: 8,
                borderRadius: 6,
                border: '1px solid rgba(148, 163, 184, 0.55)',
                marginBottom: 10,
                width: '100%',
              }}
            />
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, color: '#1f2937' }}>Color</label>
            <input
              type="color"
              value={player.color}
              onChange={e => onChange(idx, 'color', e.target.value)}
              style={{
                width: '100%',
                height: 36,
                border: 'none',
                background: 'none',
                marginBottom: 12,
              }}
            />
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, color: '#1f2937' }}>Role</label>
            <select
              value={player.isComputer ? 'computer' : 'human'}
              onChange={e => onChange(idx, 'isComputer', e.target.value === 'computer')}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid rgba(148, 163, 184, 0.55)',
                background: '#fff',
                fontWeight: 600,
              }}
            >
              <option value="human">Human</option>
              <option value="computer">Computer</option>
            </select>
          </div>
        ))}
      </div>
      {setupError && (
        <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>{setupError}</div>
      )}
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

PlayerSetup.propTypes = {
  playerSetup: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string.isRequired,
      isComputer: PropTypes.bool,
    })
  ).isRequired,
  playerCount: PropTypes.number.isRequired,
  onPlayerCountChange: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setupError: PropTypes.string,
}
