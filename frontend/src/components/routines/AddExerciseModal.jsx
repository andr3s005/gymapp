import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { getExercisesRequest } from '../../services/exerciseService'

function AddExerciseModal({ onClose, onAdd }) {
  const [exercises, setExercises] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState('')
  const [rest, setRest] = useState(60)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getExercisesRequest().then((data) => setExercises(data.exercises))
  }, [])

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd() {
    if (!selected) return
    setLoading(true)
    try {
      await onAdd({
        exercise_id: selected.id,
        sets: Number(sets),
        reps: Number(reps),
        weight_kg: weight ? Number(weight) : null,
        rest_seconds: Number(rest),
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text-primary text-lg">Agregar ejercicio</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="w-full bg-bg border border-surface-hover rounded-lg pl-9 pr-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
          />
        </div>

        <div className="max-h-44 overflow-y-auto flex flex-col gap-1.5 mb-4">
          {filtered.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setSelected(exercise)}
              className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                selected?.id === exercise.id
                  ? 'bg-strength/10 border border-strength text-text-primary'
                  : 'bg-bg border border-surface-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="font-medium">{exercise.name}</span>
              <span className="text-xs ml-2 opacity-60">{exercise.muscle_group}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">Sin resultados</p>
          )}
        </div>

        {selected && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Series', value: sets, set: setSets },
              { label: 'Reps', value: reps, set: setReps },
              { label: 'Peso (kg)', value: weight, set: setWeight, placeholder: '—' },
              { label: 'Descanso (s)', value: rest, set: setRest },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="text-xs text-text-secondary font-body block mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder || ''}
                  className="w-full bg-bg border border-surface-hover rounded-lg px-2 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-strength text-center"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected || loading}
            className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-40"
          >
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddExerciseModal