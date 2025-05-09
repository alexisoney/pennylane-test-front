import _axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { ApiProviderMock } from 'lib/test/ApiProviderMock'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InvoiceEditor } from './InvoiceEditor'
import { GetSearchCustomers, GetSearchProducts } from 'types'

const axios = new AxiosMockAdapter(_axios)

const getSearchCustomersMock: GetSearchCustomers = {
  pagination: { page: 1, page_size: 1, total_entries: 1, total_pages: 1 },
  customers: [
    {
      id: 6773,
      first_name: 'Jean',
      last_name: 'Dupont',
      address: '9 impasse Sauvey',
      zip_code: '50100',
      city: 'Cherbourg',
      country: 'France',
      country_code: 'FR',
    },
  ],
}

const getSearchProductsMock: GetSearchProducts = {
  pagination: { page: 1, page_size: 1, total_entries: 1, total_pages: 1 },
  products: [
    {
      id: 67,
      label: 'Tesla Model S',
      vat_rate: '0',
      unit: 'hour',
      unit_price: '1980',
      unit_price_without_tax: '1800',
      unit_tax: '180',
    },
  ],
}

describe('InvoiceEditor', () => {
  beforeEach(() => {
    axios.resetHandlers()
    axios.reset()
  })

  it('requires a customer', async () => {
    axios.onGet('/products/search').reply(200, getSearchProductsMock)

    render(<InvoiceEditor />, { wrapper: ApiProviderMock })

    await userEvent.click(screen.getByLabelText(/product/i))
    await userEvent.click(await screen.findByText(/^tesla\smodel\ss$/i))

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(axios.history.post).toHaveLength(0)

    expect(await screen.findByText(/customer is required/i)).toBeInTheDocument()
  })

  it('requires at least one product', async () => {
    axios.onGet('/customers/search').reply(200, getSearchCustomersMock)

    render(<InvoiceEditor />, { wrapper: ApiProviderMock })

    await userEvent.click(screen.getByLabelText(/customer/i))
    await userEvent.click(await screen.findByText(/^jean\sdupont$/i))

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(axios.history.post).toHaveLength(0)

    expect(await screen.findByText(/product is required/i)).toBeInTheDocument()
  })

  it('requires a quantity', async () => {
    axios.onGet('/customers/search').reply(200, getSearchCustomersMock)
    axios.onGet('/products/search').reply(200, getSearchProductsMock)

    render(<InvoiceEditor />, { wrapper: ApiProviderMock })

    await userEvent.click(screen.getByLabelText(/customer/i))
    await userEvent.click(await screen.findByText(/^jean\sdupont$/i))

    await userEvent.click(screen.getByLabelText(/product/i))
    await userEvent.click(await screen.findByText(/^tesla\smodel\ss$/i))

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(axios.history.post).toHaveLength(0)

    expect(await screen.findByText(/quantity is required/i)).toBeInTheDocument()
  })

  it('requires at least one line', async () => {
    render(<InvoiceEditor />, { wrapper: ApiProviderMock })

    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /append/i }))

    expect(await screen.findAllByText(/delete/i)).toHaveLength(1)
  })

  it('posts a new invoice', async () => {
    axios.onGet('/customers/search').reply(200, getSearchCustomersMock)
    axios.onGet('/products/search').reply(200, getSearchProductsMock)
    axios.onPost('/invoices').reply(200, {})

    render(<InvoiceEditor />, { wrapper: ApiProviderMock })

    await userEvent.click(screen.getByLabelText(/customer/i))
    await userEvent.click(await screen.findByText(/^jean\sdupont$/i))

    await userEvent.click(screen.getByLabelText(/product/i))
    await userEvent.click(await screen.findByText(/^tesla\smodel\ss$/i))

    await userEvent.type(screen.getByLabelText(/quantity/i), '1')

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    await screen.findByText(/invoice created/i)

    expect(axios.history.post).toHaveLength(1)

    const body = JSON.parse(axios.history.post[0].data)

    expect(body).toStrictEqual({
      invoice: {
        customer_id: getSearchCustomersMock.customers[0].id,
        date: '',
        deadline: '',
        invoice_lines_attributes: [
          {
            product_id: getSearchProductsMock.products[0].id,
            label: '',
            quantity: 1,
            unit: '',
            price: '',
            tax: '',
          },
        ],
      },
    })
  })
})
