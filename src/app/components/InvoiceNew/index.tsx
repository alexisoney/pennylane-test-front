import { InvoiceEditor, InvoiceEditorData } from '../InvoiceEditor'

export function InvoiceNew() {
  async function onSubmit(data: InvoiceEditorData) {
    // TO DO
    // await api.postInvoices(null, {
    //   invoice: {
    //     customer_id: data.customer?.id as number,
    //     date: to_YYYY_MM_DD(data.date),
    //     deadline: to_YYYY_MM_DD(data.deadline),
    //     invoice_lines_attributes: data.lines.map(({ product, ...attr }) => ({
    //       product_id: product?.id as number,
    //       ...attr,
    //     })),
    //   },
    // })
  }

  return (
    <section>
      <h1>New Invoice</h1>
      <InvoiceEditor onSubmit={onSubmit} />
    </section>
  )
}
