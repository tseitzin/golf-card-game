import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import PlayerBoard from './PlayerBoard.jsx'

const renderBoard = (cards, props = {}) => {
  const player = { cards, flippedCount: 0 }
  return render(
    <PlayerBoard
      index={0}
      player={player}
      name="Alice"
      color="#fff7ed"
      isComputer={false}
      runningTotal={props.runningTotal ?? 20}
      canInteractWithCard={props.canInteractWithCard ?? (() => false)}
      onCardClick={props.onCardClick ?? vi.fn()}
    />,
  )
}

describe('PlayerBoard', () => {
  it('highlights all cards in matching bonus columns', () => {
    const cards = [
      { id: 't0', value: 5, faceUp: true },
      { id: 't1', value: 5, faceUp: true },
      { id: 't2', value: 9, faceUp: true },
      { id: 't3', value: 4, faceUp: true },
      { id: 'b0', value: 5, faceUp: true },
      { id: 'b1', value: 5, faceUp: true },
      { id: 'b2', value: 1, faceUp: true },
      { id: 'b3', value: 8, faceUp: true },
    ]

    renderBoard(cards)

    const highlightedCards = screen.getAllByText('5')
    highlightedCards.forEach(node => {
      expect(node).toHaveStyle({ background: '#fee2e2', color: '#7f1d1d' })
    })

    const nonHighlightCard = screen.getByText('9')
    expect(nonHighlightCard).toHaveStyle({ background: '#eee', color: '#222' })
  })

  it('does not highlight single matching columns', () => {
    const cards = [
      { id: 't0', value: 7, faceUp: true },
      { id: 't1', value: 3, faceUp: true },
      { id: 't2', value: 6, faceUp: true },
      { id: 't3', value: 4, faceUp: true },
      { id: 'b0', value: 7, faceUp: true },
      { id: 'b1', value: 2, faceUp: true },
      { id: 'b2', value: 11, faceUp: true },
      { id: 'b3', value: 9, faceUp: true },
    ]

    renderBoard(cards, { runningTotal: 18 })

    const pair = screen.getAllByText('7')
    pair.forEach(node => {
      expect(node).toHaveStyle({ background: '#eee', color: '#222', border: '1px solid #333' })
    })
  })
})
