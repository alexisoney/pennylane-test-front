import _axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

import { render, screen } from '@testing-library/react'

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
} from 'lib/test/InvoiceEditorActions'

import InvoiceNew from '.'

const axios = new AxiosMockAdapter(_axios)

describe('InvoiceNew', () => {
  beforeEach(() => {
    axios.reset()
  })

  it('creates a new invoice', async () => {
    axios.onGet('/customers/search').reply(200, getSearchCustomersMock)
    axios.onGet('/products/search').reply(200, getSearchProductsMock)
    axios.onPost('/invoices').reply(200, {})

    render(<InvoiceNew />, { wrapper: ApiProviderMock })

    await selectCustomer()
    await selectProduct()
    await setQuantity()
    await submitForm()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/invoice created/i)

    expect(axios.history.post).toHaveLength(1)

    const body = JSON.parse(axios.history.post[0].data)

    expect(body).toStrictEqual({
      invoice: {
        customer_id: getSearchCustomersMock.customers[0].id,
        date: '',
        deadline: '',
        finalized: false,
        invoice_lines_attributes: [
          {
            product_id: getSearchProductsMock.products[0].id,
            quantity: 1,
            label: '',
            price: '',
            tax: '',
            unit: '',
          },
        ],
      },
    })
  })
})
