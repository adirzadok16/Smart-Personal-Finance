import { BrowserRouter as ReactRouter, Routes, Route } from 'react-router-dom'
import Login from './routes/login'
import Singup from './routes/singup'
import Home from './routes/home'
import Dashboard from './routes/dashboard'
import AddTransaction from './routes/addTranactions'

function App() {
  return (
    <ReactRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Singup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
      </Routes>
    </ReactRouter>
  )
}

export default App
