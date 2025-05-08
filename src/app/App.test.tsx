import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import AxiosMockAdapter from 'axios-mock-adapter'
import _axios from 'axios'
import { ApiProviderMock } from 'lib/test/ApiProviderMock'
import userEvent from '@testing-library/user-event'

const axios = new AxiosMockAdapter(_axios)

describe('App', () => {
  beforeEach(() => {
    axios.resetHandlers()
    axios.reset()
  })

  it('displays invoices on the home page', async () => {
    axios.onGet('/invoices').reply(200, { invoices: [] })

    render(<App />, { wrapper: ApiProviderMock })

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    expect(screen.getByText(/your invoices/i)).toBeInTheDocument()
  })

  it('navigates to the new invoice page when clicking create button', async () => {
    axios.onGet('/invoices').reply(200, { invoices: [] })

    render(<App />, { wrapper: ApiProviderMock })

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    await userEvent.click(screen.getByText(/create an invoice/i))

    expect(screen.getByText(/New Invoice/i)).toBeInTheDocument()
  })
})
