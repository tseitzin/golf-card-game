import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Scorecard from './Scorecard.jsx'

const sampleBreakdown = override => ({
  rawScore: 8,
  matchingColumnCount: 0,
  minusFiveCount: 0,
  bonus: 0,
  final: 8,
  columns: [
    { top: 2, bottom: 6, canceled: false, isMinusFivePair: false },
    { top: 3, bottom: 5, canceled: false, isMinusFivePair: false },
    { top: 7, bottom: 1, canceled: false, isMinusFivePair: false },
    { top: 9, bottom: 4, canceled: false, isMinusFivePair: false },
  ],
  ...override,
})

describe('Scorecard', () => {
  it('shows running totals and opens the breakdown modal for a scored hole', () => {
    const holeScores = [
      {
        hole: 1,
        scores: [4, 6],
        breakdowns: [sampleBreakdown({ rawScore: 4, final: 4 }), sampleBreakdown({ rawScore: 6, final: 6 })],
      },
      {
        hole: 2,
        scores: [-15, 3],
        breakdowns: [
          sampleBreakdown({
            rawScore: -5,
            matchingColumnCount: 2,
            bonus: -10,
            final: -15,
            columns: [
              { top: 5, bottom: 5, canceled: true, isMinusFivePair: false },
              { top: 5, bottom: 5, canceled: true, isMinusFivePair: false },
              { top: -5, bottom: -5, canceled: false, isMinusFivePair: true },
              { top: 8, bottom: 3, canceled: false, isMinusFivePair: false },
            ],
          }),
          sampleBreakdown({ rawScore: 3, final: 3 })
        ],
      },
    ]

    render(
      <Scorecard
        holeScores={holeScores}
        overallTotals={[-11, 9]}
        currentHole={2}
        playerNames={['Alice', 'Bob']}
      />,
    )

    expect(screen.getByText('Play Nine: The Card Game of Golf')).toBeInTheDocument()

    const roundTwoSubtotalRow = screen.getByText('Round 2 Subtotal').closest('tr')
    expect(roundTwoSubtotalRow).toBeTruthy()
    expect(within(roundTwoSubtotalRow).getByText('-11')).toBeInTheDocument()
    expect(within(roundTwoSubtotalRow).getByText('9')).toBeInTheDocument()

    const roundThreeSubtotalRow = screen.getByText('Round 3 Subtotal').closest('tr')
    expect(roundThreeSubtotalRow).toBeTruthy()
    expect(within(roundThreeSubtotalRow).getAllByText('--').length).toBeGreaterThan(0)

    const holeTwoRow = screen.getAllByRole('row').find(row => within(row).queryByText('2'))
    expect(holeTwoRow).toBeTruthy()
    const aliceCell = within(holeTwoRow).getByText(/-15/).closest('td')
    expect(aliceCell).toBeTruthy()
    expect(within(aliceCell).getByText('-15')).toBeInTheDocument()
    expect(within(aliceCell).queryByText(/\(-11\)/)).not.toBeInTheDocument()

    fireEvent.click(aliceCell)

    expect(screen.getByText('Hole 2 - Alice')).toBeInTheDocument()
    const matchingLabel = screen.getByText('Matching Columns')
    expect(matchingLabel).toBeInTheDocument()
    expect(within(matchingLabel.parentElement).getByText('2')).toBeInTheDocument()
    const finalLabel = screen.getByText('Final')
    expect(finalLabel).toBeInTheDocument()
    expect(within(finalLabel.parentElement).getByText('-15')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Close breakdown'))
    expect(screen.queryByText('Hole 2 – Alice')).not.toBeInTheDocument()
  })
})
