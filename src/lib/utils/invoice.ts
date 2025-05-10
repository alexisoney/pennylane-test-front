import { InvoiceEditorData } from 'app/components/InvoiceEditor'
import { InvoiceCreatePayload, InvoiceLine } from 'types'
import { to_YYYY_MM_DD } from './date'

export function toApiPayload(data: InvoiceEditorData): InvoiceCreatePayload {
  const { customer, date, deadline, lines } = data

  if (!customer) throw new Error('Customer is required')

  return {
    customer_id: customer.id,
    date: to_YYYY_MM_DD(date),
    deadline: to_YYYY_MM_DD(deadline),
    invoice_lines_attributes: lines.map(mapInvoiceLine),
  }
}

function mapInvoiceLine(line: InvoiceEditorData['lines'][0]): InvoiceLine {
  const { product, quantity, label, price, tax, unit } = line

  if (!product) throw new Error('Product is required')

  return {
    product_id: product.id,
    quantity,
    label,
    price,
    tax,
    unit,
  }
}
