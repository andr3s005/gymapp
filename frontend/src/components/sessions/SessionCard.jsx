function SessionCard({ session, isSelected, onClick }) {
  const isActive = !session.ended_at
  const exerciseCount = session.session_exercises?.length || 0
  const completedCount = session.session_exercises?.filter((e) => e.completed).length || 0

  function formatRelativeDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    return `Hace ${diffDays} días`
  }

  function formatElapsed(startedAt) {
    const diff = Math.floor((new Date() - new Date(startedAt)) / (1000 * 60))
    if (diff < 60) return `${diff} min`
    return `${Math.floor(diff / 60)}h ${diff % 60}min`
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-3 cursor-pointer transition-colors border ${
        isActive
          ? 'bg-strength/10 border-strength'
          : isSelected
          ? 'bg-surface border-strength/50'
          : 'bg-surface border-surface-hover hover:border-strength/30'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold font-display text-text-primary truncate">
          {session.routines?.name || 'Sesión libre'}
        </p>
        {isActive ? (
          <span className="text-xs bg-strength text-bg font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
            En curso
          </span>
        ) : (
          session.perceived_effort && (
            <span className="text-xs text-strength font-bold shrink-0 ml-2">
              RPE {session.perceived_effort}
            </span>
          )
        )}
      </div>
      <p className="text-xs text-text-secondary font-body">
        {isActive
          ? `Iniciada hace ${formatElapsed(session.started_at)} · ${completedCount}/${exerciseCount} series`
          : `${formatRelativeDate(session.started_at)} · ${session.duration_min || '?'} min · ${exerciseCount} series`
        }
      </p>
    </div>
  )
}

export default SessionCard