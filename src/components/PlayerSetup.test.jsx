import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import PlayerSetup from './PlayerSetup.jsx'

const baseSetup = [
  { name: '', color: '#fbbf24', isComputer: false },
  { name: 'CPU', color: '#38bdf8', isComputer: true },
]

describe('PlayerSetup', () => {
  it('lets the host adjust player settings and submits the form', () => {
    const onPlayerCountChange = vi.fn()
    const onChange = vi.fn()
    const onSubmit = vi.fn(e => e.preventDefault())

    render(
      <PlayerSetup
        playerSetup={baseSetup}
        playerCount={2}
        onPlayerCountChange={onPlayerCountChange}
        onChange={onChange}
        onSubmit={onSubmit}
        setupError={null}
      />,
    )

    const playerCountInput = screen.getByRole('spinbutton')
    fireEvent.change(playerCountInput, { target: { value: '4' } })
    expect(onPlayerCountChange).toHaveBeenCalledWith(4)

    const nameInput = screen.getByPlaceholderText('Player 1')
    fireEvent.change(nameInput, { target: { value: 'Alice' } })
    expect(onChange).toHaveBeenCalledWith(0, 'name', 'Alice')

    const roleSelects = screen.getAllByRole('combobox')
    fireEvent.change(roleSelects[1], { target: { value: 'human' } })
    expect(onChange).toHaveBeenCalledWith(1, 'isComputer', false)

    const colorInputs = screen.getAllByDisplayValue(/#/)
    fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } })
    expect(onChange).toHaveBeenCalledWith(0, 'color', '#ff0000')

    fireEvent.submit(screen.getByText('Start Game').closest('form'))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('displays setup errors when provided', () => {
    render(
      <PlayerSetup
        playerSetup={baseSetup}
        playerCount={2}
        onPlayerCountChange={() => {}}
        onChange={() => {}}
        onSubmit={e => e.preventDefault()}
        setupError="At least one human player is required."
      />,
    )

    expect(screen.getByText('At least one human player is required.')).toBeInTheDocument()
  })
})
