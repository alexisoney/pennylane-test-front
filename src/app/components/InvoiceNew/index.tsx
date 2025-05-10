import { useApi } from 'api'
import { InvoiceEditor, InvoiceEditorData } from '../InvoiceEditor'
import { to_YYYY_MM_DD } from 'lib/utils/date'

function InvoiceNew() {
  const api = useApi()

  async function onSubmit({
    customer,
    date,
    deadline,
    lines,
  }: InvoiceEditorData) {
    if (!customer) throw new Error('Customer is required')

    await api.postInvoices(null, {
      invoice: {
        customer_id: customer.id,
        date: to_YYYY_MM_DD(date),
        deadline: to_YYYY_MM_DD(deadline),
        invoice_lines_attributes: lines.map(({ product, ...attr }, index) => {
          if (!product) throw new Error(`Missing product for line ${index}`)
          else return { product_id: product.id, ...attr }
        }),
      },
    })
  }

  return (
    <section>
      <h1>New Invoice</h1>
      <InvoiceEditor onSubmit={onSubmit} />
    </section>
  )
}

export default InvoiceNew
