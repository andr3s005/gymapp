import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

const days = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
]

function AvailabilityModal({ coach, currentAvailability, onClose, onSave }) {
  const [slots, setSlots] = useState(
    currentAvailability.length > 0
      ? currentAvailability.map((a) => ({
          day_of_week: a.day_of_week,
          start_time: a.start_time.slice(0, 5),
          end_time: a.end_time.slice(0, 5),
        }))
      : [{ day_of_week: 'monday', start_time: '06:00', end_time: '14:00' }]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { day_of_week: 'monday', start_time: '06:00', end_time: '14:00' },
    ])
  }

  function removeSlot(index) {
    setSlots((prev) => prev.filter((_, i) => i !== index))
  }

  function updateSlot(index, field, value) {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    )
  }

  async function handleSave() {
    if (slots.length === 0) {
      setError('Agrega al menos un horario')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSave(slots)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar disponibilidad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary text-lg">
            Mi disponibilidad
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {slots.map((slot, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={slot.day_of_week}
                onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                className="flex-1 bg-bg border border-surface-hover rounded-lg px-3 py-2 text-text-primary font-body text-xs focus:outline-none focus:border-strength"
              >
                {days.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                className="w-24 bg-bg border border-surface-hover rounded-lg px-2 py-2 text-text-primary font-body text-xs focus:outline-none focus:border-strength"
              />
              <span className="text-text-secondary text-xs">—</span>
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                className="w-24 bg-bg border border-surface-hover rounded-lg px-2 py-2 text-text-primary font-body text-xs focus:outline-none focus:border-strength"
              />
              <button
                onClick={() => removeSlot(index)}
                className="text-text-secondary hover:text-effort shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSlot}
          className="w-full border border-dashed border-surface-hover rounded-lg py-2 text-xs text-text-secondary hover:text-strength hover:border-strength transition-colors flex items-center justify-center gap-1.5 mb-4 font-body"
        >
          <Plus size={13} />
          Agregar horario
        </button>

        {error && <p className="text-sm text-effort font-body mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityModal