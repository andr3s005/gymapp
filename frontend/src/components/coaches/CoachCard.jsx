import { Clock, Calendar } from 'lucide-react'

const specialtyLabels = {
  training: 'Entrenamiento',
  nutrition: 'Nutrición',
  both: 'Entrenamiento y Nutrición',
}

const dayLabels = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
}

const avatarColors = [
  'var(--color-strength)',
  'var(--color-nutrition)',
  'var(--color-effort)',
]

function CoachCard({ coach, isMyCoach, onAssign, onUnassign, canChange }) {
  const initials = coach.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  const avatarColor = avatarColors[
    coach.full_name?.charCodeAt(0) % avatarColors.length
  ]

  const availability = coach.coach_availability || []
  const days = availability.map((a) => dayLabels[a.day_of_week]).join(', ')
  const hours = availability.length > 0
    ? `${availability[0].start_time.slice(0, 5)} — ${availability[0].end_time.slice(0, 5)}`
    : null

  return (
    <div className={`bg-surface rounded-2xl p-5 flex flex-col gap-4 border transition-colors ${
      isMyCoach ? 'border-strength' : 'border-surface-hover'
    }`}>
      {isMyCoach && (
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-strength/10 text-strength w-fit font-body">
          Tu coach actual
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0"
          style={{
            background: avatarColor,
            color: 'var(--color-bg)',
          }}
        >
          {initials}
        </div>
        <div>
          <h3 className="font-display font-bold text-text-primary text-sm">
            {coach.full_name}
          </h3>
          <p className="text-xs text-text-secondary font-body mt-0.5">
            {specialtyLabels[coach.specialty] || 'Sin especialidad registrada'}
          </p>
        </div>
      </div>

      {availability.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {days && (
            <div className="flex items-center gap-2 text-xs text-text-secondary font-body">
              <Calendar size={12} />
              <span>{days}</span>
            </div>
          )}
          {hours && (
            <div className="flex items-center gap-2 text-xs text-text-secondary font-body">
              <Clock size={12} />
              <span>{hours}</span>
            </div>
          )}
        </div>
      )}

      {availability.length === 0 && (
        <p className="text-xs text-text-secondary font-body">Sin horarios registrados</p>
      )}

      {isMyCoach ? (
        <button
          onClick={onUnassign}
          disabled={!canChange}
          className="w-full text-xs py-2 rounded-lg border font-body transition-colors disabled:opacity-40"
          style={{
            color: 'var(--color-effort)',
            borderColor: 'var(--color-effort)',
            backgroundColor: 'var(--color-effort)1A',
          }}
          title={!canChange ? 'Solo puedes cambiar de coach el 1 de cada mes' : ''}
        >
          {canChange ? 'Cambiar coach' : 'Cambio disponible el 1 del mes'}
        </button>
      ) : (
        <button
          onClick={() => onAssign(coach.id)}
          className="w-full text-xs py-2 rounded-lg bg-strength text-bg font-bold font-body"
        >
          Elegir coach
        </button>
      )}
    </div>
  )
}

export default CoachCard