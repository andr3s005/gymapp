const difficultyColors = {
  beginner: 'var(--color-nutrition)',
  intermediate: 'var(--color-strength)',
  advanced: 'var(--color-effort)',
}

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const muscleGroupLabels = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Cuerpo completo',
}

function ExerciseCard({ exercise }) {
  return (
    <div className="bg-surface border border-surface-hover rounded-xl p-4 flex flex-col gap-2 hover:border-strength/40 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <h3 className="font-display font-bold text-text-primary text-sm leading-snug">
          {exercise.name}
        </h3>
        {exercise.is_custom && (
          <span className="text-xs text-nutrition bg-nutrition/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
            Propio
          </span>
        )}
      </div>

      <p className="text-xs text-text-secondary font-body">
        {muscleGroupLabels[exercise.muscle_group] || exercise.muscle_group}
        {exercise.equipment && ` · ${exercise.equipment}`}
      </p>

      {exercise.difficulty && (
        <span
          className="text-xs font-medium w-fit px-2 py-0.5 rounded-full mt-1"
          style={{
            color: difficultyColors[exercise.difficulty],
            backgroundColor: `${difficultyColors[exercise.difficulty]}1A`,
          }}
        >
          {difficultyLabels[exercise.difficulty]}
        </span>
      )}
    </div>
  )
}

export default ExerciseCard