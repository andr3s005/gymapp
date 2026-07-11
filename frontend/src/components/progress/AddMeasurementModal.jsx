import { useState } from 'react'
import { X } from 'lucide-react'

const fields = [
  { key: 'weight_kg', label: 'Peso (kg)', placeholder: '75' },
  { key: 'body_fat_pct', label: '% Grasa corporal', placeholder: '18' },
  { key: 'chest_cm', label: 'Pecho (cm)', placeholder: '95' },
  { key: 'waist_cm', label: 'Cintura (cm)', placeholder: '82' },
  { key: 'hips_cm', label: 'Cadera (cm)', placeholder: '95' },
  { key: 'bicep_cm', label: 'Bícep (cm)', placeholder: '35' },
  { key: 'thigh_cm', label: 'Muslo (cm)', placeholder: '55' },
]

function AddMeasurementModal({ onClose, onCreate }) {
  const [values, setValues] = useState({})
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const hasValue = Object.values(values).some((v) => v !== '' && v !== undefined)
    if (!hasValue) {
      setError('Registra al menos una medida')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onCreate({ ...values, notes: notes || null })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar medidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary text-lg">Registrar medidas</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-text-secondary font-body mb-4">
          Llena solo los campos que tengas disponibles — no es obligatorio llenar todos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-text-secondary font-body block mb-1">{label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={values[key] || ''}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-text-secondary font-body block mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-bg border border-surface-hover rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-strength resize-none"
              placeholder="Ej. Después de 4 semanas de déficit calórico"
            />
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
              {loading ? 'Guardando...' : 'Guardar medidas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMeasurementModal