import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import RoutineCard from '../components/routines/RoutineCard'
import RoutineExerciseItem from '../components/routines/RoutineExerciseItem'
import CreateRoutineModal from '../components/routines/CreateRoutineModal'
import AddExerciseModal from '../components/routines/AddExerciseModal'
import {
  getRoutinesRequest,
  createRoutineRequest,
  deleteRoutineRequest,
  addExerciseToRoutineRequest,
  removeExerciseFromRoutineRequest,
} from '../services/routineService'

function Routines() {
  const [routines, setRoutines] = useState([])
  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)

  useEffect(() => {
    loadRoutines()
  }, [])

  async function loadRoutines() {
    setLoading(true)
    try {
      const data = await getRoutinesRequest()
      setRoutines(data.routines)
    } catch (err) {
      console.error('Error cargando rutinas:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRoutine(routineData) {
    const data = await createRoutineRequest(routineData)
    const newRoutine = { ...data.routine, routine_exercises: [] }
    setRoutines((prev) => [newRoutine, ...prev])
    setSelectedRoutine(newRoutine)
  }

  async function handleDeleteRoutine(routineId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta rutina?')) return
    await deleteRoutineRequest(routineId)
    const updated = routines.filter((r) => r.id !== routineId)
    setRoutines(updated)
    setSelectedRoutine(updated.length > 0 ? updated[0] : null)
  }

  async function handleAddExercise(exerciseData) {
    const data = await addExerciseToRoutineRequest(selectedRoutine.id, exerciseData)
    const newExercise = data.routine_exercise
    setSelectedRoutine((prev) => ({
      ...prev,
      routine_exercises: [...(prev.routine_exercises || []), newExercise],
    }))
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === selectedRoutine.id
          ? { ...r, routine_exercises: [...(r.routine_exercises || []), newExercise] }
          : r
      )
    )
  }

  async function handleRemoveExercise(routineExerciseId) {
    await removeExerciseFromRoutineRequest(selectedRoutine.id, routineExerciseId)
    setSelectedRoutine((prev) => ({
      ...prev,
      routine_exercises: prev.routine_exercises.filter((e) => e.id !== routineExerciseId),
    }))
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === selectedRoutine.id
          ? {
              ...r,
              routine_exercises: r.routine_exercises.filter((e) => e.id !== routineExerciseId),
            }
          : r
      )
    )
  }

  const sortedExercises = selectedRoutine?.routine_exercises
    ?.slice()
    .sort((a, b) => a.order_index - b.order_index) || []

  return (
  <DashboardLayout>
    <div className="flex h-screen overflow-hidden">

      {/* Panel izquierdo — lista de rutinas */}
        <div className={`${selectedRoutine ? 'hidden md:flex' : 'flex'} w-full md:w-72 border-r border-surface-hover flex-col`}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-surface-hover">
            <h1 className="font-display font-bold text-text-primary text-lg">Mis Rutinas</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-strength text-bg text-xs font-bold font-body px-3 py-1.5 rounded-lg"
            >
              <Plus size={13} />
              Nueva
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading && (
              <p className="text-text-secondary text-sm font-body text-center mt-8">
                Cargando rutinas...
              </p>
            )}

            {!loading && routines.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-text-secondary text-sm font-body">Sin rutinas todavía</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-strength text-sm font-body mt-2"
                >
                  Crea tu primera rutina
                </button>
              </div>
            )}

            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                isSelected={selectedRoutine?.id === routine.id}
                onClick={() => setSelectedRoutine(routine)}
              />
            ))}
          </div>
        </div>

        {/* Panel derecho — detalle de rutina */}
        <div className={`${selectedRoutine ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {!selectedRoutine ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-secondary font-body text-sm">
                Selecciona o crea una rutina para comenzar
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 md:px-8 py-5 border-b border-surface-hover flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Botón volver — solo móvil */}
                  <button
                    onClick={() => setSelectedRoutine(null)}
                    className="md:hidden text-text-secondary hover:text-text-primary"
                  >
                    ‹
                  </button>
                  <div>
                    <h2 className="font-display font-bold text-text-primary text-xl">
                      {selectedRoutine.name}
                    </h2>
                    <p className="text-sm text-text-secondary font-body mt-0.5">
                      {selectedRoutine.description && `${selectedRoutine.description} · `}
                      {selectedRoutine.estimated_duration_min
                        ? `${selectedRoutine.estimated_duration_min} min estimados`
                        : 'Sin duración estimada'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRoutine(selectedRoutine.id)}
                  className="text-xs text-effort border border-effort/40 px-3 py-1.5 rounded-lg hover:bg-effort/10 transition-colors font-body shrink-0"
                >
                  Eliminar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-3">
                {sortedExercises.length === 0 && (
                  <p className="text-text-secondary text-sm font-body">
                    Esta rutina no tiene ejercicios todavía.
                  </p>
                )}

                {sortedExercises.map((re, index) => (
                  <RoutineExerciseItem
                    key={re.id}
                    routineExercise={re}
                    index={index}
                    onRemove={handleRemoveExercise}
                  />
                ))}

                <button
                  onClick={() => setShowAddExerciseModal(true)}
                  className="border-2 border-dashed border-surface-hover rounded-xl py-4 text-sm text-text-secondary font-body hover:border-strength/40 hover:text-strength transition-colors"
                >
                  + Agregar ejercicio
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateRoutineModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoutine}
        />
      )}

      {showAddExerciseModal && (
        <AddExerciseModal
          onClose={() => setShowAddExerciseModal(false)}
          onAdd={handleAddExercise}
        />
      )}
    </DashboardLayout>
  )
}

export default Routines