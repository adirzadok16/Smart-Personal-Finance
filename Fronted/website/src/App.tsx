import { BrowserRouter as ReactRouter, Routes, Route } from 'react-router-dom'
import Login from './routes/login'
import Singup from './routes/singup'
import Home from './routes/home'
import Dashboard from './routes/dashboard'

function App() {
  return (
    <ReactRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Singup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </ReactRouter>
  )
}

export default App
