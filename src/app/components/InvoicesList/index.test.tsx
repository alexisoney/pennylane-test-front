import InvoicesList from '.'
import { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Paths } from 'api/gen/client'
import AxiosMockAdapter from 'axios-mock-adapter'
import _axios from 'axios'
import _ from 'lodash'
import {
  BrowserRouter,
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom'
import { ApiProviderMock } from 'lib/test/ApiProviderMock'

const axios = new AxiosMockAdapter(_axios)

type Invoice = Paths.GetInvoices.Responses.$200['invoices'][number]

const invoice: Invoice = {
  id: 123,
  customer_id: null,
  finalized: true,
  paid: false,
  date: null,
  deadline: null,
  total: null,
  tax: null,
  invoice_lines: [],
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ApiProviderMock>{children}</ApiProviderMock>
    </BrowserRouter>
  )
}

describe('InvoicesList', () => {
  beforeEach(() => {
    axios.resetHandlers()
    axios.reset()
  })

  it('displays a loader while fetching data', async () => {
    axios.onGet('/invoices').reply(200, { invoices: [] })

    render(<InvoicesList />, { wrapper: Wrapper })

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await screen.findByRole('table')

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('renders an error alert when network request fails', async () => {
    axios.onGet('/invoices').reply(500)

    render(<InvoicesList />, { wrapper: Wrapper })

    const error = await screen.findByRole('alert')

    expect(error).toBeInTheDocument()

    const rows = screen.getAllByRole('row')

    expect(rows).toHaveLength(1)

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('renders all invoices in the table', async () => {
    const invoices = _.times(50, (id) => ({ ...invoice, id }))

    axios.onGet('/invoices').reply(200, { invoices })

    render(<InvoicesList />, { wrapper: Wrapper })

    expect(axios.history.get.length).toBe(1)

    await waitFor(() => {
      const table = screen.getByRole('table')
      const rows = within(table).getAllByRole('button')
      expect(rows).toHaveLength(invoices.length)
    })

    const error = screen.queryByRole('alert')

    expect(error).not.toBeInTheDocument()
  })

  it('displays all table column headers', async () => {
    axios.onGet('/invoices').reply(500)

    render(<InvoicesList />, { wrapper: Wrapper })

    await screen.findByRole('alert')

    const headers = [
      screen.getByText('Date'),
      screen.getByText('Customer'),
      screen.getByText('Amount'),
      screen.getByText('Status'),
    ]

    for (const header of headers) {
      expect(header).toBeInTheDocument()
    }
  })

  it('displays the invoice date in formatted form', async () => {
    axios.onGet('/invoices').reply(200, {
      invoices: [
        {
          ...invoice,
          date: '2021-02-03',
        },
      ],
    })

    render(<InvoicesList />, { wrapper: Wrapper })

    const date = await screen.findByText('Feb 03, 2021')

    expect(date).toBeInTheDocument()
  })

  it("displays the invoice customer's full name", async () => {
    axios.onGet('/invoices').reply(200, {
      invoices: [
        { ...invoice, customer: { first_name: 'Jane', last_name: 'Doe' } },
      ],
    })

    render(<InvoicesList />, { wrapper: Wrapper })

    const customer = await screen.findByText('Jane Doe')

    expect(customer).toBeInTheDocument()
  })

  it('ddisplays the invoice amount with currency formatting', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, total: 16458.56 }] })

    render(<InvoicesList />, { wrapper: Wrapper })

    const amount = await screen.findByText('$16,458.56')

    expect(amount).toBeInTheDocument()
  })

  it('isplays invoice status as "Draft" when not finalized', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, finalized: false }] })

    render(<InvoicesList />, { wrapper: Wrapper })

    const status = await screen.findByText('Draft')

    expect(status).toBeInTheDocument()
  })

  it('displays invoice status as "Pending" when finalized but unpaid', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, finalized: true }] })

    render(<InvoicesList />, { wrapper: Wrapper })

    const status = await screen.findByText('Pending')

    expect(status).toBeInTheDocument()
  })

  it('displays invoice status as "Paid" when finalized and paid', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, finalized: true, paid: true }] })

    render(<InvoicesList />, { wrapper: Wrapper })

    const status = await screen.findByText('Paid')

    expect(status).toBeInTheDocument()
  })

  it('navigates to the edit invoice page', async () => {
    const invoices = [{ ...invoice, customer: { first_name: 'Jane' } }]

    axios.onGet('/invoices').reply(200, { invoices })

    const EditPage = () => <div>Edit Page</div>

    const router = createMemoryRouter([
      { path: '/', element: <InvoicesList /> },
      { path: `/invoices/${invoices[0].id}/edit`, element: <EditPage /> },
    ])

    render(<RouterProvider router={router} />, { wrapper: ApiProviderMock })

    const table = await screen.findByRole('table')
    const row = await within(table).findByRole('button')

    await userEvent.click(row)

    expect(await screen.findByText('Edit Page')).toBeInTheDocument()
  })

  it('navigates to the new invoice page when clicking the create button', async () => {
    axios.onGet('/invoices').reply(200, { invoices: [] })

    const CreatePage = () => <div>New Invoice Page</div>

    const router = createMemoryRouter([
      { path: '/', element: <InvoicesList /> },
      { path: `/invoices/new`, element: <CreatePage /> },
    ])

    render(<RouterProvider router={router} />, { wrapper: ApiProviderMock })

    const btn = await screen.findByText('Create an invoice')

    userEvent.click(btn)

    expect(await screen.findByText('New Invoice Page')).toBeInTheDocument()
  })
})
