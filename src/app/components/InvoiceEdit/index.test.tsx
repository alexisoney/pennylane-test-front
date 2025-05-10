import _axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { ApiProviderMock } from 'lib/test/ApiProviderMock'
import {
  getSearchCustomersMock,
  getSearchProductsMock,
} from 'lib/test/InvoiceEditorMocks'
import { submitForm } from 'lib/test/InvoiceEditorActions'

import InvoiceEdit from '.'

import { Filter } from 'types'

const axios = new AxiosMockAdapter(_axios)

const invoiceMock = {
  id: 123,
  customer_id: getSearchCustomersMock.customers[0].id,
  finalized: false,
  paid: true,
  date: '2021-02-03',
  deadline: '2021-03-05',
  total: '120.00',
  tax: '20.00',
  invoice_lines: [
    {
      id: 9181,
      invoice_id: 123,
      product_id: getSearchProductsMock.products[0].id,
      quantity: 1,
      label: 'Tesla Model S with Pennylane logo',
      unit: 'hour',
      vat_rate: '0',
      price: '1620.00',
      tax: '20.00',
      product: {
        id: getSearchProductsMock.products[0].id,
        label: 'Tesla Model S',
        vat_rate: '0',
        unit: 'hour',
        unit_price: '1980',
        unit_price_without_tax: '1800',
        unit_tax: '180',
      },
    },
  ],
}

function renderComponent() {
  render(
    <MemoryRouter initialEntries={['/invoices/123/edit']}>
      <ApiProviderMock>
        <Routes>
          <Route path="/invoices/:id/edit" Component={InvoiceEdit} />
        </Routes>
      </ApiProviderMock>
    </MemoryRouter>
  )
}

describe('InvoiceEdit', () => {
  beforeEach(() => {
    axios.reset()

    axios.onGet('/customers/search').reply(200, getSearchCustomersMock)
    axios.onGet('/products/search').reply(200, getSearchProductsMock)
  })

  it('displays an error alert on network error', async () => {
    axios.onGet('/invoices/123').reply(500)

    renderComponent()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/loading/i)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/something went wrong/i)
  })

  it('displays an error alert when invoice is not found', async () => {
    axios.onGet('/invoices/123').reply(404)

    renderComponent()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/invoice not found/i)
  })

  it('updates an existing invoice and displays success alert', async () => {
    const filter: Filter = [
      {
        field: 'customer_id',
        operator: 'eq',
        value: `${invoiceMock.customer_id}`,
      },
    ]

    axios.onGet('/invoices/123').reply(200, invoiceMock)
    axios
      .onGet('/invoices', { params: { filter: JSON.stringify(filter) } })
      .reply(200, {
        invoices: [{ customer: getSearchCustomersMock.customers[0] }],
      })

    axios.onPut('/invoices/123').reply(200, {})

    renderComponent()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    await userEvent.clear(screen.getByLabelText(/quantity/i))
    await userEvent.type(screen.getByLabelText(/quantity/i), '3')
    await submitForm()

    const alert = await screen.findByRole('alert')

    expect(alert).toHaveTextContent(/invoice created/i)

    expect(axios.history.put).toHaveLength(1)

    const body = JSON.parse(axios.history.put[0].data)

    expect(body).toStrictEqual({
      invoice: {
        id: 123,
        customer_id: invoiceMock.customer_id,
        date: invoiceMock.date,
        deadline: invoiceMock.deadline,
        finalized: invoiceMock.finalized,
        invoice_lines_attributes: [
          {
            product_id: invoiceMock.invoice_lines[0].product_id,
            quantity: 3,
            label: invoiceMock.invoice_lines[0].label,
            price: invoiceMock.invoice_lines[0].price,
            tax: invoiceMock.invoice_lines[0].tax,
            unit: invoiceMock.invoice_lines[0].unit,
          },
        ],
      },
    })
  })
})
