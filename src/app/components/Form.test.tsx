import { render, screen } from '@testing-library/react'
import { Form } from './Form'

describe('Form.Error', () => {
  it('renders nothing when no children', () => {
    const { container } = render(<Form.Error />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the children', () => {
    render(<Form.Error>Hello</Form.Error>)
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
  })

  it('adds the custom class name', () => {
    render(<Form.Error className="a-custom-class">Hello</Form.Error>)
    expect(screen.getByText(/hello/i)).toHaveClass('a-custom-class')
  })
})

describe('Form.Label', () => {
  it('renders a label element', () => {
    render(<Form.Label>Hello</Form.Label>)
    expect(screen.getByText(/hello/i).tagName).toBe('LABEL')
  })

  it('adds the custom class name', () => {
    render(<Form.Label className="a-custom-class">Hello</Form.Label>)
    expect(screen.getByText(/hello/i)).toHaveClass('a-custom-class')
  })
})
