import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import ActionBar from './ActionBar.jsx'

describe('ActionBar', () => {
  it('calls the provided callbacks when buttons are clicked', () => {
    const handlers = {
      onReset: vi.fn(),
      onClearSave: vi.fn(),
      onEndRound: vi.fn(),
      onNextHole: vi.fn(),
    }

    render(
      <ActionBar
        {...handlers}
        roundOver
        currentHole={3}
      />,
    )

    fireEvent.click(screen.getByText('Reset'))
    fireEvent.click(screen.getByText('Clear Save'))
    fireEvent.click(screen.getByText('End Round'))
    fireEvent.click(screen.getByText('Next Hole'))

    expect(handlers.onReset).toHaveBeenCalled()
    expect(handlers.onClearSave).toHaveBeenCalled()
    expect(handlers.onEndRound).toHaveBeenCalled()
    expect(handlers.onNextHole).toHaveBeenCalled()
  })

  it('only shows the next hole button when the round is over and hole is below nine', () => {
    const { rerender } = render(
      <ActionBar
        onReset={() => {}}
        onClearSave={() => {}}
        onEndRound={() => {}}
        onNextHole={() => {}}
        roundOver={false}
        currentHole={3}
      />,
    )

    expect(screen.queryByText('Next Hole')).not.toBeInTheDocument()

    rerender(
      <ActionBar
        onReset={() => {}}
        onClearSave={() => {}}
        onEndRound={() => {}}
        onNextHole={() => {}}
        roundOver
        currentHole={9}
      />,
    )

    expect(screen.queryByText('Next Hole')).not.toBeInTheDocument()

    rerender(
      <ActionBar
        onReset={() => {}}
        onClearSave={() => {}}
        onEndRound={() => {}}
        onNextHole={() => {}}
        roundOver
        currentHole={4}
      />,
    )

    expect(screen.getByText('Next Hole')).toBeInTheDocument()
  })
})
