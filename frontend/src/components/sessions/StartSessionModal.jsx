import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getRoutinesRequest } from '../../services/routineService'

function StartSessionModal({ onClose, onStart }) {
  const [routines, setRoutines] = useState([])
  const [selectedRoutineId, setSelectedRoutineId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRoutinesRequest().then((data) => setRoutines(data.routines))
  }, [])

  async function handleStart() {
    setLoading(true)
    try {
      await onStart({
        routine_id: selectedRoutineId || null,
        notes: notes.trim() || null,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary text-lg">Nueva sesión</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">
              Rutina (opcional)
            </label>
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
            >
              <option value="">Sesión libre (sin rutina)</option>
              {routines.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength resize-none"
              placeholder="Ej. Día de fuerza máxima..."
            />
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5"
            >
              Cancelar
            </button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60"
            >
              {loading ? 'Iniciando...' : '¡Entrenar!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartSessionModal