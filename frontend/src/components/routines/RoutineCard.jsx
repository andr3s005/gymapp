function RoutineCard({ routine, isSelected, onClick }) {
  const exerciseCount = routine.routine_exercises?.length || 0

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-xl p-4 cursor-pointer transition-colors ${
        isSelected
          ? 'border border-strength'
          : 'border border-surface-hover hover:border-strength/40'
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-display font-bold text-text-primary text-sm">
          {routine.name}
        </h3>
        {routine.estimated_duration_min && (
          <span className="text-xs text-text-secondary shrink-0 ml-2">
            {routine.estimated_duration_min} min
          </span>
        )}
      </div>

      {routine.description && (
        <p className="text-xs text-text-secondary font-body mt-1.5 line-clamp-2">
          {routine.description}
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-strength/10 text-strength">
          {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
        {routine.is_template && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-nutrition/10 text-nutrition">
            Plantilla
          </span>
        )}
      </div>
    </div>
  )
}

export default RoutineCard