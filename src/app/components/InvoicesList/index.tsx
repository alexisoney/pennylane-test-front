import { useApi } from 'api'
import { Invoice } from 'types'
import { useEffect, useCallback, useState } from 'react'
import { formatDate } from 'lib/utils/date'
import { formatCurrency } from 'lib/utils/currency'
import { useNavigate } from 'react-router-dom'

const InvoicesList = (): React.ReactElement => {
  const api = useApi()
  const navigate = useNavigate()

  const [invoicesList, setInvoicesList] = useState<Invoice[]>([])
  const [error, setError] = useState<string>()

  const fetchInvoices = useCallback(async () => {
    try {
      const { data } = await api.getInvoices()
      setInvoicesList(data.invoices)
    } catch (error) {
      setError('Network error')
    }
  }, [api])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return (
    <>
      {!!error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoicesList.map(
            ({ id, date, customer, total, finalized, paid }) => {
              const status = finalized ? (paid ? 'Paid' : 'Pending') : 'Draft'

              return (
                <tr
                  key={id}
                  onClick={() => navigate(`/invoice/${id}/edit`)}
                  role="button"
                >
                  <td>{formatDate(date)}</td>
                  <td>
                    {customer?.first_name} {customer?.last_name}
                  </td>
                  <td>{formatCurrency(total)}</td>
                  <td>{status}</td>
                </tr>
              )
            }
          )}
        </tbody>
      </table>
    </>
  )
}

export default InvoicesList
