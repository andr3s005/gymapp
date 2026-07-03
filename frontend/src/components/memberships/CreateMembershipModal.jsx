import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../services/api'

const planLabels = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  biannual: 'Semestral',
  annual: 'Anual',
}

const paymentMethods = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
}

function CreateMembershipModal({ onClose, onCreate }) {
  const [users, setUsers] = useState([])
  const [userId, setUserId] = useState('')
  const [planType, setPlanType] = useState('monthly')
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/users').then((res) => {
      setUsers(res.data.users || [])
    }).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId || !amount) {
      setError('Usuario y monto son obligatorios')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onCreate({
        user_id: userId,
        plan_type: planType,
        start_date: startDate,
        payment_amount: Number(amount),
        payment_method: paymentMethod,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la membresía')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary text-lg">Nueva membresía</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">Usuario</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
            >
              <option value="">Selecciona un usuario...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} — {u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">Plan</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
            >
              {Object.entries(planLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary font-body block mb-1.5">Monto ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary font-body block mb-1.5">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
              >
                {Object.entries(paymentMethods).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-effort font-body">{error}</p>}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60"
            >
              {loading ? 'Creando...' : 'Crear membresía'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMembershipModal