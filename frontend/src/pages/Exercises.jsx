import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ExerciseCard from '../components/exercises/ExerciseCard'
import MuscleGroupFilter from '../components/exercises/MuscleGroupFilter'
import { getExercisesRequest } from '../services/exerciseService'

function Exercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')

  useEffect(() => {
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

    loadExercises()
  }, [muscleGroup])

  return (
    <DashboardLayout>
      <div className="px-10 py-8">
        <h1 className="text-2xl font-bold font-display text-text-primary mb-1">
          Ejercicios
        </h1>
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
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Exercises