import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Card from './Card.jsx'

describe('Card', () => {
  it('displays a question mark when the card is face down and handles clicks', () => {
    const onClick = vi.fn()
    render(<Card card={{ id: 1, value: 9, faceUp: false }} onClick={onClick} interactive width={60} height={80} />)
    expect(screen.getByText('?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('?'))
    expect(onClick).toHaveBeenCalled()
  })

  it('uses the highlighted styling when requested', () => {
    render(<Card card={{ id: 2, value: 7, faceUp: true }} highlighted />)
    const face = screen.getByText('7')
    expect(face).toHaveStyle({ background: '#fee2e2', color: '#7f1d1d', border: '1px solid #f87171' })
  })
})
