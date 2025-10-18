import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import DrawDiscardArea from './DrawDiscardArea.jsx'

describe('DrawDiscardArea', () => {
  it('renders dash when no discardTop', () => {
    const { getByText } = render(
      <DrawDiscardArea
        drawnCard={null}
        discardTop={null}
        canDraw={false}
        canPickUp={false}
        canDiscard={false}
        onDraw={() => {}}
        onPickUp={() => {}}
        onDiscard={() => {}}
      />,
    )
    expect(getByText('-')).toBeTruthy()
  })

  it('renders numeric value including zero and negative', () => {
    const samples = [-5, 0, 12]
    samples.forEach(val => {
      const { getByText, unmount } = render(
        <DrawDiscardArea
          drawnCard={null}
          discardTop={{ id: 999, value: val, faceUp: true }}
          canDraw={false}
          canPickUp={false}
          canDiscard={false}
          onDraw={() => {}}
          onPickUp={() => {}}
          onDiscard={() => {}}
        />,
      )
      expect(getByText(String(val))).toBeTruthy()
      unmount()
    })
  })
})