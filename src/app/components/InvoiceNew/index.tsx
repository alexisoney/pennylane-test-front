import { useApi } from 'api'
import { InvoiceEditor, InvoiceEditorData } from '../InvoiceEditor'
import { toApiPayload } from 'lib/utils/invoice'

function InvoiceNew() {
  const api = useApi()

  async function onSubmit(data: InvoiceEditorData) {
    await api.postInvoices(null, { invoice: toApiPayload(data) })
  }

  return (
    <section>
      <h1>New Invoice</h1>
      <InvoiceEditor onSubmit={onSubmit} />
    </section>
  )
}

export default InvoiceNew
