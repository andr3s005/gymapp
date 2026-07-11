import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import DashboardLayout from '../components/layout/DashboardLayout'
import ExerciseCard from '../components/exercises/ExerciseCard'
import MuscleGroupFilter from '../components/exercises/MuscleGroupFilter'
import { getExercisesRequest, createExerciseRequest, updateExerciseRequest, deleteExerciseRequest } from '../services/exerciseService'

function CreateExerciseForm({ onSubmit, onClose, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '')
  const [muscleGroup, setMuscleGroup] = useState(initialData?.muscle_group || 'chest')
  const [category, setCategory] = useState(initialData?.category || 'strength')
  const [equipment, setEquipment] = useState(initialData?.equipment || '')
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'intermediate')
  const [instructions, setInstructions] = useState(initialData?.instructions || '')
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
      await onSubmit({
        name: name.trim(),
        muscle_group: muscleGroup,
        category,
        equipment: equipment.trim() || null,
        difficulty,
        instructions: instructions.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el ejercicio')
    } finally {
      setLoading(false)
    }
  }

  const selectClass = "w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"
  const inputClass = "w-full bg-bg border border-surface-hover rounded-lg px-4 py-2.5 text-text-primary font-body text-sm focus:outline-none focus:border-strength"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm text-text-secondary font-body block mb-1.5">Nombre</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Press de banca" className={inputClass} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-text-secondary font-body block mb-1.5">Grupo muscular</label>
          <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className={selectClass}>
            <option value="chest">Pecho</option>
            <option value="back">Espalda</option>
            <option value="legs">Piernas</option>
            <option value="shoulders">Hombros</option>
            <option value="arms">Brazos</option>
            <option value="core">Core</option>
            <option value="cardio">Cardio</option>
            <option value="full_body">Cuerpo completo</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary font-body block mb-1.5">Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="strength">Fuerza</option>
            <option value="hypertrophy">Hipertrofia</option>
            <option value="endurance">Resistencia muscular</option>
            <option value="cardio">Cardio</option>
            <option value="mobility">Movilidad</option>
            <option value="plyometric">Pliométrico</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-text-secondary font-body block mb-1.5">Equipo</label>
          <input type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)}
            placeholder="Barra y banca" className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-text-secondary font-body block mb-1.5">Dificultad</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectClass}>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-text-secondary font-body block mb-1.5">Instrucciones (opcional)</label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
          rows={3} placeholder="Describe cómo ejecutar el ejercicio..."
          className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-sm text-effort font-body">{error}</p>}

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onClose}
          className="flex-1 bg-bg border border-surface-hover text-text-primary font-body text-sm rounded-lg py-2.5">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-strength text-bg font-bold font-body text-sm rounded-lg py-2.5 disabled:opacity-60">
          {loading ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear ejercicio'}
        </button>
      </div>
    </form>
  )
}

function Exercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)


  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  async function loadExercises() {
    setLoading(true)
    setError('')
    try {
      const data = await getExercisesRequest({ muscle_group: muscleGroup })
      setExercises(data.exercises)
    } catch (err) {
      setError('No se pudieron cargar los ejercicios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExercises()
  }, [muscleGroup])

  async function handleCreateExercise(exerciseData) {
    await createExerciseRequest(exerciseData)
    await loadExercises()
  }

  async function handleDeleteExercise(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) return
    await deleteExerciseRequest(id)
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleUpdateExercise(exerciseData) {
    await updateExerciseRequest(editingExercise.id, exerciseData)
    await loadExercises()
  }

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold font-display text-text-primary">
            Ejercicios
          </h1>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-strength text-bg text-xs font-bold font-body px-4 py-2 rounded-lg"
            >
              <Plus size={13} />
              Nuevo ejercicio
            </button>
          )}
        </div>

        <p className="text-sm text-text-secondary font-body mb-6">
          Catálogo de ejercicios disponibles
        </p>

        <div className="mb-6">
          <MuscleGroupFilter selected={muscleGroup} onSelect={setMuscleGroup} />
        </div>

        {loading && (
          <p className="text-text-secondary font-body text-sm">Cargando ejercicios...</p>
        )}

        {error && (
          <p className="text-effort font-body text-sm">{error}</p>
        )}

        {!loading && !error && exercises.length === 0 && (
          <p className="text-text-secondary font-body text-sm">
            No hay ejercicios para este filtro todavía.
          </p>
        )}

        {!loading && exercises.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isAdmin={isAdmin}
                onEdit={setEditingExercise}
                onDelete={handleDeleteExercise}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-text-primary text-lg">Nuevo ejercicio</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <CreateExerciseForm
              onSubmit={handleCreateExercise}
              onClose={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      {editingExercise && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-surface-hover rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-text-primary text-lg">Editar ejercicio</h2>
              <button onClick={() => setEditingExercise(null)} className="text-text-secondary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <CreateExerciseForm
              initialData={editingExercise}
              onSubmit={handleUpdateExercise}
              onClose={() => setEditingExercise(null)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Exercises