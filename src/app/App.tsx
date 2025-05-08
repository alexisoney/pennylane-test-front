import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import InvoicesList from './components/InvoicesList'
import InvoiceShow from './components/InvoiceShow'
import { InvoiceNew } from './components/InvoiceNew'

function App() {
  return (
    <div className="px-5">
      <Router>
        <Routes>
          <Route path="/invoices/new" Component={InvoiceNew} />
          <Route path="/invoice/:id" Component={InvoiceShow} />
          <Route path="/" Component={InvoicesList} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
