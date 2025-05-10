import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import InvoicesList from './components/InvoicesList'
import InvoiceShow from './components/InvoiceShow'
import InvoiceEdit from './components/InvoiceEdit'
import InvoiceNew from './components/InvoiceNew'

function App() {
  return (
    <div className="px-5">
      <Router>
        <Routes>
          <Route path="/invoices/new" Component={InvoiceNew} />
          <Route path="/invoices/:id/edit" Component={InvoiceEdit} />
          <Route path="/invoice/:id" Component={InvoiceShow} />
          <Route path="/" Component={InvoicesList} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
