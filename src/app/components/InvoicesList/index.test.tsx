import InvoicesList from '.'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Paths } from 'api/gen/client'
import { ApiProvider } from 'api'
import AxiosMockAdapter from 'axios-mock-adapter'
import _axios from 'axios'
import _ from 'lodash'
import {
  BrowserRouter,
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom'

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

beforeEach(() => {
  axios.resetHandlers()
  axios.reset()
})

function renderComponent() {
  return render(
    <ApiProvider url="" token="">
      <InvoicesList />
    </ApiProvider>,
    { wrapper: BrowserRouter }
  )
}

describe('InvoicesList', () => {
  it('renders an error alert when network request fails', async () => {
    axios.onGet('/invoices').reply(500)

    renderComponent()

    const error = await screen.findByRole('alert')

    expect(error).toBeInTheDocument()

    const rows = screen.getAllByRole('row')

    expect(rows).toHaveLength(1)
  })

  it('renders all invoices in the table', async () => {
    const invoices = _.times(50, (id) => ({ ...invoice, id }))

    axios.onGet('/invoices').reply(200, { invoices })

    renderComponent()

    expect(axios.history.get.length).toBe(1)

    await waitFor(() => {
      const [_header, ...rows] = screen.getAllByRole('row')
      expect(rows).toHaveLength(invoices.length)
    })

    const error = screen.queryByRole('alert')

    expect(error).not.toBeInTheDocument()
  })

  it('displays all table column headers', async () => {
    axios.onGet('/invoices').reply(500)

    renderComponent()

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

    renderComponent()

    const date = await screen.findByText('Feb 03, 2021')

    expect(date).toBeInTheDocument()
  })

  it("displays the invoice customer's full name", async () => {
    axios.onGet('/invoices').reply(200, {
      invoices: [
        { ...invoice, customer: { first_name: 'Jane', last_name: 'Doe' } },
      ],
    })

    renderComponent()

    const customer = await screen.findByText('Jane Doe')

    expect(customer).toBeInTheDocument()
  })

  it('ddisplays the invoice amount with currency formatting', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, total: 16458.56 }] })

    renderComponent()

    const amount = await screen.findByText('$16,458.56')

    expect(amount).toBeInTheDocument()
  })

  it('isplays invoice status as "Draft" when not finalized', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, finalized: false }] })

    renderComponent()

    const status = await screen.findByText('Draft')

    expect(status).toBeInTheDocument()
  })

  it('displays invoice status as "Pending" when finalized but unpaid', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, finalized: true }] })

    renderComponent()

    const status = await screen.findByText('Pending')

    expect(status).toBeInTheDocument()
  })

  it('displays invoice status as "Paid" when finalized and paid', async () => {
    axios
      .onGet('/invoices')
      .reply(200, { invoices: [{ ...invoice, finalized: true, paid: true }] })

    renderComponent()

    const status = await screen.findByText('Paid')

    expect(status).toBeInTheDocument()
  })

  it('navigates to the edit invoice page', async () => {
    const invoices = [
      {
        ...invoice,
        customer: { first_name: 'Jane' },
      },
    ]

    axios.onGet('/invoices').reply(200, {
      invoices,
    })

    const router = createMemoryRouter(
      [
        {
          path: '/invoices',
          element: (
            <ApiProvider url="" token="">
              <InvoicesList />
            </ApiProvider>
          ),
        },
        {
          path: `/invoice/${invoices[0].id}/edit`,
          element: <div>Edit Page</div>,
        },
      ],
      { initialEntries: ['/invoices'] }
    )

    render(<RouterProvider router={router} />)

    const row = await screen.findByText('Jane')

    await userEvent.click(row)

    expect(await screen.findByText('Edit Page')).toBeInTheDocument()
  })
})
