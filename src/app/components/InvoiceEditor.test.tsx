import _axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiProviderMock } from 'lib/test/ApiProviderMock'
import {
  getSearchCustomersMock,
  getSearchProductsMock,
} from 'lib/test/InvoiceEditorMocks'
import {
  selectCustomer,
  selectProduct,
  setQuantity,
  submitForm,
  submitFormAsFinalized,
} from 'lib/test/InvoiceEditorActions'

import { InvoiceEditor } from './InvoiceEditor'

const axios = new AxiosMockAdapter(_axios)

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

  it('submits a draft invoice', async () => {
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
      finalized: 'false',
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

  it('submits a finalized invoice', async () => {
    render(<InvoiceEditor onSubmit={onSubmit} />, { wrapper: ApiProviderMock })

    await selectCustomer()
    await selectProduct()
    await setQuantity()
    await submitFormAsFinalized()

    await screen.findByText(/invoice created/i)

    expect(onSubmit).toHaveBeenCalledTimes(1)

    expect(onSubmit).toHaveBeenCalledWith({
      customer: getSearchCustomersMock.customers[0],
      date: undefined,
      deadline: undefined,
      finalized: 'true',
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
})
