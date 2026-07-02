import { Trash2 } from 'lucide-react'

function RoutineExerciseItem({ routineExercise, index, onRemove }) {
  const exercise = routineExercise.exercises

  return (
    <div className="bg-surface border border-surface-hover rounded-xl p-4 flex items-center gap-4">
      <span className="font-display font-bold text-surface-hover text-lg w-6 shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary font-display">
          {exercise?.name}
        </p>
        <p className="text-xs text-text-secondary font-body mt-0.5">
          {routineExercise.sets} series · {routineExercise.reps} reps
          {routineExercise.weight_kg && ` · ${routineExercise.weight_kg}kg`}
          {routineExercise.rest_seconds && ` · ${routineExercise.rest_seconds}s descanso`}
        </p>
      </div>

      <button
        onClick={() => onRemove(routineExercise.id)}
        className="text-text-secondary hover:text-effort transition-colors shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

export default RoutineExerciseItem