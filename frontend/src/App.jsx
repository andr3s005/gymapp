import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<div className="text-white p-8">Página de Login (próximamente)</div>} />
      <Route path="/register" element={<div className="text-white p-8">Página de Registro (próximamente)</div>} />
      <Route path="/dashboard" element={<div className="text-white p-8">Dashboard (próximamente)</div>} />
      <Route path="/" element={<div className="text-white p-8">Home (próximamente)</div>} />
    </Routes>
  )
}

export default App