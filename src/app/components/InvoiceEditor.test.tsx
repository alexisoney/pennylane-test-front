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

async function selectCustomer() {
  await userEvent.click(screen.getByLabelText(/customer/i))
  await userEvent.click(await screen.findByText(/^jean\sdupont$/i))
}

async function selectProduct() {
  await userEvent.click(screen.getByLabelText(/product/i))
  await userEvent.click(await screen.findByText(/^tesla\smodel\ss$/i))
}

async function setQuantity() {
  await userEvent.type(screen.getByLabelText(/quantity/i), '1')
}

async function submitForm() {
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
}

const onSubmit = jest.fn()

describe('InvoiceEditor', () => {
  beforeEach(() => {
    axios.resetHandlers()
    axios.reset()

    axios.onGet('/customers/search').reply(200, getSearchCustomersMock)
    axios.onGet('/products/search').reply(200, getSearchProductsMock)

    onSubmit.mockReset()
  })

  it('requires a customer', async () => {
    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    await selectProduct()
    await setQuantity()
    await submitForm()

    expect(axios.history.post).toHaveLength(0)

    expect(await screen.findByText(/customer is required/i)).toBeInTheDocument()
  })

  it('requires at least one product', async () => {
    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    await selectCustomer()
    await setQuantity()
    await submitForm()

    expect(axios.history.post).toHaveLength(0)

    expect(await screen.findByText(/product is required/i)).toBeInTheDocument()
  })

  it('requires a quantity', async () => {
    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    await selectCustomer()
    await selectProduct()
    await submitForm()

    expect(axios.history.post).toHaveLength(0)

    expect(await screen.findByText(/quantity is required/i)).toBeInTheDocument()
  })

  it('requires at least one line', async () => {
    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /append/i }))

    expect(await screen.findAllByText(/delete/i)).toHaveLength(1)
  })

  it('posts a new invoice', async () => {
    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    await selectCustomer()
    await selectProduct()
    await setQuantity()
    await submitForm()

    await screen.findByText(/invoice created/i)

    expect(onSubmit).toHaveBeenCalledTimes(1)

    expect(onSubmit).toHaveBeenCalledWith({
      customer: getSearchCustomersMock.customers[0],
      date: undefined,
      deadline: undefined,
      lines: [
        {
          product: getSearchProductsMock.products[0],
          label: '',
          quantity: 1,
          unit: '',
          price: '',
          tax: '',
        },
      ],
    })
  })

  it('displays an error alert when submission fails', async () => {
    onSubmit.mockImplementation(async () => Promise.reject())

    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    await selectCustomer()
    await selectProduct()
    await setQuantity()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await submitForm()

    const alert = await screen.findByRole('alert')

    expect(alert).toHaveTextContent(/something went wrong/i)

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
