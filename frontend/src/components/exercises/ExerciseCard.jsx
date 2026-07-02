import { Dumbbell, PersonStanding, Footprints, ArrowUpFromLine, BicepsFlexed, CircleDot, HeartPulse, Sparkles } from 'lucide-react'

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

const muscleGroupConfig = {
  chest: { label: 'Pecho', icon: ArrowUpFromLine },
  back: { label: 'Espalda', icon: PersonStanding },
  legs: { label: 'Piernas', icon: Footprints },
  shoulders: { label: 'Hombros', icon: Dumbbell },
  arms: { label: 'Brazos', icon: BicepsFlexed },
  core: { label: 'Core', icon: CircleDot },
  cardio: { label: 'Cardio', icon: HeartPulse },
  full_body: { label: 'Cuerpo completo', icon: Sparkles },
}

function ExerciseCard({ exercise }) {
  const config = muscleGroupConfig[exercise.muscle_group]
  const MuscleIcon = config?.icon || Dumbbell

  return (
    <div className="bg-surface border border-surface-hover rounded-xl p-4 flex flex-col gap-2 hover:border-strength/40 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-bg flex items-center justify-center shrink-0">
            <MuscleIcon size={14} className="text-strength" />
          </div>
          <h3 className="font-display font-bold text-text-primary text-sm leading-snug">
            {exercise.name}
          </h3>
        </div>
        {exercise.is_custom && (
          <span className="text-xs text-nutrition bg-nutrition/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
            Propio
          </span>
        )}
      </div>

      <p className="text-xs text-text-secondary font-body pl-9">
        {config?.label || exercise.muscle_group}
        {exercise.equipment && ` · ${exercise.equipment}`}
      </p>

      {exercise.difficulty && (
        <span
          className="text-xs font-medium w-fit px-2 py-0.5 rounded-full mt-1 ml-9"
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