import { render, screen } from '@testing-library/react'
import { Loader } from './Loader'

describe('Loader', () => {
  it('returns loading status', () => {
    render(<Loader />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent(/loading/i)
  })
})
