import React, { useState } from 'react'

export default function Scorecard({ holeScores, overallTotals, currentHole, playerNames }) {
  const [open, setOpen] = useState(null) // { hole, playerIndex }

  const handleCellClick = (hole, playerIndex, record) => {
    if (!record) return
    if (open && open.hole === hole && open.playerIndex === playerIndex) {
      setOpen(null)
    } else {
      setOpen({ hole, playerIndex })
    }
  }

  const findRecord = hole => holeScores.find(h => h.hole === hole)
  const openRecord = open ? findRecord(open.hole) : null
  const openBreakdown = openRecord ? openRecord.breakdowns?.[open.playerIndex] : null

  return (
    <div style={{
      background: '#fff',
      padding: 16,
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: 520,
      margin: '0 auto',
      marginTop: 24,
      fontSize: 14,
      position: 'relative'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Scorecard (Hole {currentHole} / 9)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #ddd' }}>Hole</th>
            {playerNames.map((n, i) => (
              <th key={i} style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid #ddd' }}>{n}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(9)].map((_, hIdx) => {
            const holeNumber = hIdx + 1
            const record = findRecord(holeNumber)
            const isCurrent = holeNumber === currentHole
            return (
              <tr key={holeNumber} style={{ background: isCurrent ? '#f0fdf4' : 'transparent' }}>
                <td style={{ padding: '4px 6px', borderBottom: '1px solid #eee', fontWeight: isCurrent ? 'bold' : 'normal' }}>{holeNumber}</td>
                {playerNames.map((_, pi) => {
                  const isOpen = open && open.hole === holeNumber && open.playerIndex === pi
                  const hasRecord = !!record
                  return (
                    <td
                      key={pi}
                      onClick={() => handleCellClick(holeNumber, pi, record)}
                      title={hasRecord ? 'Click for breakdown' : ''}
                      style={{
                        padding: '4px 6px',
                        textAlign: 'right',
                        borderBottom: '1px solid #eee',
                        cursor: hasRecord ? 'pointer' : 'default',
                        background: isOpen ? '#eef2ff' : 'transparent',
                        position: 'relative'
                      }}
                    >
                      {record ? record.scores[pi] : ''}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ padding: '6px', borderTop: '1px solid #ddd', fontWeight: 'bold' }}>Total</td>
            {overallTotals.map((t, i) => (
              <td key={i} style={{ padding: '6px', textAlign: 'right', borderTop: '1px solid #ddd', fontWeight: 'bold' }}>{t}</td>
            ))}
          </tr>
        </tfoot>
      </table>
      {open && openBreakdown && (
        <div style={{
          position: 'absolute',
          top: 70,
          right: 8,
          width: 300,
          background: '#1f2937',
          color: '#f1f5f9',
          borderRadius: 8,
          padding: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 50
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontWeight: '600' }}>Hole {open.hole} – {playerNames[open.playerIndex]}</div>
            <button
              onClick={() => setOpen(null)}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1
              }}
              aria-label="Close breakdown"
            >×</button>
          </div>
          <div style={{ fontSize: 12, marginBottom: 8, color: '#cbd5e1' }}>
            Raw Score sums columns after cancellations. Bonus derives from matching columns and -5 set.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13 }}>
            <div style={{ color: '#a5b4fc' }}>Raw Score:</div><div>{openBreakdown.rawScore}</div>
            <div style={{ color: '#a5b4fc' }}>Matching Columns:</div><div>{openBreakdown.matchingColumnCount}</div>
            <div style={{ color: '#a5b4fc' }}>-5 Count:</div><div>{openBreakdown.minusFiveCount}</div>
            <div style={{ color: '#a5b4fc' }}>Bonus:</div><div>{openBreakdown.bonus}</div>
            <div style={{ color: '#a5b4fc', fontWeight: '600' }}>Final:</div><div style={{ fontWeight: '600' }}>{openBreakdown.final}</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Columns</div>
          <table style={{ width: '100%', marginTop: 4, fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '2px 4px' }}>#</th>
                <th style={{ padding: '2px 4px' }}>Top</th>
                <th style={{ padding: '2px 4px' }}>Bot</th>
                <th style={{ padding: '2px 4px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {openBreakdown.columns.map((col, i) => {
                let status = ''
                if (col.canceled) status = 'Matched (bonus)'
                else if (col.isMinusFivePair) status = '-5 Pair'
                else status = 'Active'
                return (
                  <tr key={i} style={{ background: i % 2 ? '#334155' : 'transparent' }}>
                    <td style={{ padding: '2px 4px' }}>{i + 1}</td>
                    <td style={{ padding: '2px 4px' }}>{col.top}</td>
                    <td style={{ padding: '2px 4px' }}>{col.bottom}</td>
                    <td style={{ padding: '2px 4px', color: col.canceled ? '#22c55e' : col.isMinusFivePair ? '#facc15' : '#f1f5f9' }}>{status}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
