import { useApi } from 'api'
import { Invoice } from 'types'
import { useEffect, useCallback, useState } from 'react'
import { formatDate } from 'lib/utils/date'
import { formatCurrency } from 'lib/utils/currency'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const InvoicesList = (): React.ReactElement => {
  const api = useApi()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([])
  const [error, setError] = useState<string>()

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data } = await api.getInvoices()
      setInvoicesList(data.invoices)
    } catch (error) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return (
    <section>
      <h1>Your Invoices</h1>

      {!!error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Link to="/invoices/new" className="btn btn-primary mb-4">
        Create an invoice
      </Link>

      {isLoading && (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}

      {!isLoading && (
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
                    onClick={() => navigate(`/invoices/${id}`)}
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
      )}
    </section>
  )
}

export default InvoicesList
