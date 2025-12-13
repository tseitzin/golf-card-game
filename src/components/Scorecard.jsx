import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const TOTAL_HOLES = 9
export default function Scorecard({ holeScores, overallTotals, currentHole, playerNames }) {
  const [open, setOpen] = useState(null) // { hole, playerIndex }
  const holeColumnWidth = '15%'
  const playerColumnWidth = `${((100 - 15) / Math.max(playerNames.length, 1)).toFixed(2)}%`

  const handleCellClick = (hole, playerIndex, record) => {
    if (!record) return
    if (open && open.hole === hole && open.playerIndex === playerIndex) {
      setOpen(null)
    } else {
      setOpen({ hole, playerIndex })
    }
  }

  const holeRecordMap = useMemo(() => {
    const map = new Map()
    holeScores.forEach(record => {
      map.set(record.hole, record)
    })
    return map
  }, [holeScores])

  const openRecord = open ? holeRecordMap.get(open.hole) : null
  const openBreakdown = openRecord ? openRecord.breakdowns?.[open.playerIndex] : null

  const runningTotalsByHole = useMemo(() => {
    const cumulative = Array(playerNames.length).fill(0)
    const totals = {}
    const sorted = [...holeScores].sort((a, b) => a.hole - b.hole)
    sorted.forEach(record => {
      const running = record.scores.map((score, idx) => {
        const value = typeof score === 'number' ? score : 0
        cumulative[idx] += value
        return cumulative[idx]
      })
      totals[record.hole] = running
    })
    return totals
  }, [holeScores, playerNames.length])

  const computedGameTotals = useMemo(() => {
    const sums = Array(playerNames.length).fill(0)
    holeScores.forEach(record => {
      record.scores.forEach((score, idx) => {
        if (typeof score === 'number') sums[idx] += score
      })
    })
    return sums
  }, [holeScores, playerNames.length])

  const gameTotals = overallTotals?.length ? overallTotals : computedGameTotals

  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 12,
      boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
      maxWidth: 700,
      margin: '24px auto',
      fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
      position: 'relative'
    }}>
      <h2 style={{ margin: '0 0 16px', fontWeight: 600, textAlign: 'center' }}>Golf Card Game Scorecard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 14, tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f2f2f2', textAlign: 'left', width: holeColumnWidth }}>Hole</th>
            {playerNames.map((name, idx) => (
              <th
                key={idx}
                style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f2f2f2', width: playerColumnWidth }}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(TOTAL_HOLES)].map((_, holeIdx) => {
            const holeNumber = holeIdx + 1
            const record = holeRecordMap.get(holeNumber)
            const isCurrentHole = holeNumber === currentHole
            return (
              <React.Fragment key={holeNumber}>
                <tr style={{ background: isCurrentHole ? '#f8fff5' : 'transparent' }}>
                  <td style={{ border: '1px solid #ccc', padding: '10px', fontWeight: isCurrentHole ? 600 : 400, textAlign: 'left', width: holeColumnWidth }}>{holeNumber}</td>
                  {playerNames.map((_, playerIdx) => {
                    const hasRecord = !!record
                    const score = record ? record.scores[playerIdx] : null

                    return (
                      <td
                        key={playerIdx}
                        onClick={() => handleCellClick(holeNumber, playerIdx, record)}
                        style={{
                          border: '1px solid #ccc',
                          padding: '10px',
                          cursor: hasRecord ? 'pointer' : 'default',
                          backgroundColor: open && open.hole === holeNumber && open.playerIndex === playerIdx ? '#eef4ff' : 'transparent',
                          width: playerColumnWidth
                        }}
                        title={hasRecord ? 'Click for breakdown' : ''}
                      >
                        {hasRecord ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600 }}>{score}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#bbb' }}>--</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
                {holeNumber > 1 && (
                  <tr style={{ fontWeight: 600, backgroundColor: '#f4f7fb' }}>
                    <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'left', width: holeColumnWidth }}>Round {holeNumber} Subtotal</td>
                    {playerNames.map((_, playerIdx) => {
                      const cumulative = runningTotalsByHole[holeNumber]?.[playerIdx]
                      const hasSubtotal = typeof cumulative === 'number'
                      return (
                        <td
                          key={`subtotal-${holeNumber}-${playerIdx}`}
                          style={{ border: '1px solid #ccc', padding: '10px', width: playerColumnWidth }}
                        >
                          {hasSubtotal ? cumulative : <span style={{ color: '#bbb' }}>--</span>}
                        </td>
                      )
                    })}
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 600, backgroundColor: '#d6f5d6' }}>
            <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'left', width: holeColumnWidth }}>Game Total</td>
            {gameTotals.map((score, idx) => (
              <td
                key={idx}
                style={{ border: '1px solid #ccc', padding: '10px', width: playerColumnWidth }}
              >
                {score}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

      {open && openBreakdown && (
        <div style={{
          position: 'absolute',
          top: 60,
          right: 20,
          width: 320,
          background: '#ffffff',
          color: '#1f2933',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)',
          border: '1px solid #d1d5db'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Hole {open.hole} - {playerNames[open.playerIndex]}</div>
            <button
              onClick={() => setOpen(null)}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1
              }}
              aria-label="Close breakdown"
            >×</button>
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>
            Breakdown of raw column score, bonuses, and final hole total.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
            <div style={{ color: '#0f172a' }}>Raw Score</div><div>{openBreakdown.rawScore}</div>
            <div style={{ color: '#0f172a' }}>Matching Columns</div><div>{openBreakdown.matchingColumnCount}</div>
            <div style={{ color: '#0f172a' }}>-5 Count</div><div>{openBreakdown.minusFiveCount}</div>
            <div style={{ color: '#0f172a' }}>Bonus</div><div>{openBreakdown.bonus}</div>
            <div style={{ color: '#0f172a', fontWeight: 600 }}>Final</div><div style={{ fontWeight: 600 }}>{openBreakdown.final}</div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#1f2937' }}>Columns</div>
          <table style={{ width: '100%', marginTop: 6, fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                <th style={{ padding: '4px 6px', borderBottom: '1px solid #e2e8f0' }}>#</th>
                <th style={{ padding: '4px 6px', borderBottom: '1px solid #e2e8f0' }}>Top</th>
                <th style={{ padding: '4px 6px', borderBottom: '1px solid #e2e8f0' }}>Bottom</th>
                <th style={{ padding: '4px 6px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {openBreakdown.columns.map((col, idx) => {
                let status = 'Active'
                if (col.canceled) status = 'Matched Bonus'
                else if (col.isMinusFivePair) status = '-5 Pair'
                return (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#e2e8f0' }}>
                    <td style={{ padding: '4px 6px' }}>{idx + 1}</td>
                    <td style={{ padding: '4px 6px' }}>{col.top}</td>
                    <td style={{ padding: '4px 6px' }}>{col.bottom}</td>
                    <td style={{ padding: '4px 6px', color: col.canceled ? '#15803d' : col.isMinusFivePair ? '#b45309' : '#1f2937' }}>{status}</td>
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

Scorecard.propTypes = {
  holeScores: PropTypes.arrayOf(
    PropTypes.shape({
      hole: PropTypes.number.isRequired,
      scores: PropTypes.arrayOf(PropTypes.number).isRequired,
      breakdowns: PropTypes.arrayOf(
        PropTypes.shape({
          rawScore: PropTypes.number.isRequired,
          matchingColumnCount: PropTypes.number.isRequired,
          minusFiveCount: PropTypes.number.isRequired,
          bonus: PropTypes.number.isRequired,
          final: PropTypes.number.isRequired,
          columns: PropTypes.array,
        })
      ),
    })
  ).isRequired,
  overallTotals: PropTypes.arrayOf(PropTypes.number),
  currentHole: PropTypes.number.isRequired,
  playerNames: PropTypes.arrayOf(PropTypes.string).isRequired,
}
