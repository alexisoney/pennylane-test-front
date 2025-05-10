import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'
import { useApi } from 'api'
import axios from 'axios'

import { InvoiceEditor, InvoiceEditorData } from '../InvoiceEditor'
import { Loader } from '../Loader'

import { Customer, Filter, Invoice } from 'types'
import { toApiPayload } from 'lib/utils/invoice'

const InvoiceShow = () => {
  const { id } = useParams<{ id: string }>()

  const api = useApi()

  const [error, setError] = useState<string>()
  const [invoice, setInvoice] = useState<Invoice>()
  const [customer, setCustomer] = useState<Customer | null>(null)

  const getCustomerById = useCallback(
    async function (customer_id: number | null) {
      if (typeof customer_id === 'number') {
        const filter: Filter = [
          { field: 'customer_id', operator: 'eq', value: `${customer_id}` },
        ]

        const jsonFilter = JSON.stringify(filter)

        const { data } = await api.getInvoices({ filter: jsonFilter })

        return data.invoices[0]?.customer || null
      }

      return null
    },
    [api]
  )

  const onSubmit = useCallback(
    async function (data: InvoiceEditorData) {
      if (!invoice) throw Error('Invoice is required')

      const id = invoice.id

      await api.putInvoice(
        { id },
        { invoice: { id: invoice.id, ...toApiPayload(data) } }
      )
    },
    [invoice, api]
  )

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: invoice } = await api.getInvoice(id)
        const customer = await getCustomerById(invoice.customer_id)

        setInvoice(invoice)
        setCustomer(customer)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          switch (error.response?.status) {
            case 404: {
              return setError('Oups! Invoice not found.')
            }
          }
        }

        setError('Oups! Something went wrong. Refresh the page.')
      }
    }

    fetchData()
  }, [api, getCustomerById, id])

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  if (!invoice) return <Loader />

  return (
    <InvoiceEditor
      onSubmit={onSubmit}
      defaultValues={{
        customer,
        date: invoice.date ? new Date(invoice.date) : undefined,
        deadline: invoice.deadline ? new Date(invoice.deadline) : undefined,
        lines: invoice.invoice_lines,
      }}
    />
  )
}

export default InvoiceShow
