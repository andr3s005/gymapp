import { useState } from 'react'
import { X } from 'lucide-react'

function CreateRoutineModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || null,
        estimated_duration_min: duration ? Number(duration) : null,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la rutina')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-text-primary text-lg">Nueva rutina</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
              placeholder="Push Day"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength resize-none"
              placeholder="Pecho, hombros y tríceps"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary font-body block mb-1.5">Duración estimada (minutos, opcional)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
              placeholder="60"
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
              {loading ? 'Creando...' : 'Crear rutina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoutineModal