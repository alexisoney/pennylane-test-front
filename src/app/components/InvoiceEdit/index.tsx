import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useApi } from 'api'

import { InvoiceEditor, InvoiceEditorData } from '../InvoiceEditor'
import { Loader } from '../Loader'

import { Customer, Invoice } from 'types'

const InvoiceShow = () => {
  const { id } = useParams<{ id: string }>()

  const api = useApi()

  const [invoice, setInvoice] = useState<Invoice>()
  const [customer, setCustomer] = useState<Customer>()

  async function onSubmit(data: InvoiceEditorData) {
    // TO DO
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: invoice } = await api.getInvoice(id)

        setInvoice(invoice)

        const {
          data: { invoices },
        } = await api.getInvoices({
          filter: JSON.stringify([
            {
              field: 'customer_id',
              operator: 'eq',
              value: invoice.customer_id,
            },
          ]),
        })

        setCustomer(invoices[0]?.customer || undefined)
      } catch (error) {
        // TO DO
      }
    }

    fetchData()
  }, [api, id])

  if (!invoice || !customer) return <Loader />

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
