import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SessionCard from '../components/sessions/SessionCard'
import SessionExerciseRow from '../components/sessions/SessionExerciseRow'
import StartSessionModal from '../components/sessions/StartSessionModal'
import {
  getSessionsRequest,
  getSessionByIdRequest,
  startSessionRequest,
  finishSessionRequest,
  updateSessionExerciseRequest,
  deleteSessionRequest,
} from '../services/sessionService'

function Sessions() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStartModal, setShowStartModal] = useState(false)
  const [finishingSession, setFinishingSession] = useState(false)
  const [elapsed, setElapsed] = useState('00:00')
  const timerRef = useRef(null)

  useEffect(() => {
    loadSessions()
  }, [])

  // Timer para sesión activa
  useEffect(() => {
    if (selectedSession && !selectedSession.ended_at) {
      timerRef.current = setInterval(() => {
        const diff = Math.floor((new Date() - new Date(selectedSession.started_at)) / 1000)
        const mins = Math.floor(diff / 60).toString().padStart(2, '0')
        const secs = (diff % 60).toString().padStart(2, '0')
        setElapsed(`${mins}:${secs}`)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [selectedSession])

  async function loadSessions() {
    setLoading(true)
    try {
      const data = await getSessionsRequest()
      setSessions(data.sessions)
    } catch (err) {
      console.error('Error cargando sesiones:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectSession(session) {
    const data = await getSessionByIdRequest(session.id)
    setSelectedSession(data.session)
  }

  async function handleStartSession(sessionData) {
    const data = await startSessionRequest(sessionData)
    await loadSessions()
    const full = await getSessionByIdRequest(data.session.id)
    setSelectedSession(full.session)
  }

  async function handleFinishSession() {
    if (!selectedSession) return
    const effort = prompt('¿Cuánto fue tu esfuerzo percibido? (1-10)')
    if (!effort || isNaN(effort)) return

    setFinishingSession(true)
    try {
      await finishSessionRequest(selectedSession.id, {
        perceived_effort: Number(effort),
        notes: selectedSession.notes,
      })
      await loadSessions()
      const updated = await getSessionByIdRequest(selectedSession.id)
      setSelectedSession(updated.session)
    } finally {
      setFinishingSession(false)
    }
  }

  async function handleUpdateExercise(sessionExerciseId, data) {
    await updateSessionExerciseRequest(selectedSession.id, sessionExerciseId, data)
  }

  async function handleDeleteSession(sessionId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sesión?')) return
    await deleteSessionRequest(sessionId)
    const updated = sessions.filter((s) => s.id !== sessionId)
    setSessions(updated)
    setSelectedSession(updated.length > 0 ? updated[0] : null)
  }

  // Agrupar session_exercises por ejercicio
  function groupByExercise(sessionExercises) {
    const groups = {}
    sessionExercises?.forEach((se) => {
        const key = se.exercises?.id || se.exercise_id
        if (!groups[key]) {
        groups[key] = {
            exercise: se.exercises,
            sets: [],
        }
        }
        groups[key].sets.push(se)
    })
    return Object.values(groups).map((group) => ({
        ...group,
        sets: group.sets.sort((a, b) => a.set_number - b.set_number),
    }))
    }

  const isActive = selectedSession && !selectedSession.ended_at
  const exerciseGroups = groupByExercise(selectedSession?.session_exercises)
  const completedSets = selectedSession?.session_exercises?.filter((e) => e.completed).length || 0
  const totalSets = selectedSession?.session_exercises?.length || 0

  return (
  <DashboardLayout>
    <div className="flex h-screen overflow-hidden">

      {/* Panel izquierdo — historial */}
        <div className={`${selectedSession ? 'hidden md:flex' : 'flex'} w-full md:w-72 border-r border-surface-hover flex-col shrink-0`}>
          <div className="px-4 py-5 border-b border-surface-hover">
            <h1 className="font-display font-bold text-text-primary text-lg mb-3">Sesiones</h1>
            <button
              onClick={() => setShowStartModal(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-strength text-bg text-xs font-bold font-body px-3 py-2 rounded-lg"
            >
              <Plus size={13} />
              Nueva sesión
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loading ? (
              <p className="text-text-secondary text-sm font-body text-center mt-8">
                Cargando sesiones...
              </p>
            ) : sessions.length === 0 ? (
              <div className="text-center mt-8">
                <p className="text-text-secondary text-sm font-body">Sin sesiones todavía</p>
                <button
                  onClick={() => setShowStartModal(true)}
                  className="text-strength text-sm font-body mt-2"
                >
                  Inicia tu primer entreno
                </button>
              </div>
            ) : (
              sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isSelected={selectedSession?.id === session.id}
                  onClick={() => handleSelectSession(session)}
                />
              ))
            )}
          </div>
        </div>

        {/* Panel derecho — detalle */}
        <div className={`${selectedSession ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-text-secondary font-body text-sm">
                Selecciona o inicia una sesión
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 md:px-8 py-5 border-b border-surface-hover flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Botón volver — solo móvil */}
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="md:hidden text-text-secondary hover:text-text-primary text-xl"
                  >
                    ‹
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-display font-bold text-text-primary text-xl">
                        {selectedSession.routines?.name || 'Sesión libre'}
                      </h2>
                      {isActive && (
                        <span className="text-xs bg-strength/10 text-strength border border-strength/30 px-2.5 py-0.5 rounded-full font-body">
                          En curso · {elapsed}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary font-body">
                      {isActive
                        ? `${completedSets} de ${totalSets} series completadas`
                        : `${selectedSession.duration_min || '?'} min · RPE ${selectedSession.perceived_effort || '—'} · ${totalSets} series`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {isActive && (
                    <button
                      onClick={handleFinishSession}
                      disabled={finishingSession}
                      className="text-sm font-bold font-body px-4 py-2 rounded-lg disabled:opacity-60"
                      style={{ background: 'var(--color-effort)', color: '#fff' }}
                    >
                      {finishingSession ? '...' : 'Finalizar'}
                    </button>
                  )}
                  {!isActive && (
                    <button
                      onClick={() => handleDeleteSession(selectedSession.id)}
                      className="text-xs text-effort border border-effort/40 px-3 py-1.5 rounded-lg hover:bg-effort/10 transition-colors font-body"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-4">
                {exerciseGroups.length === 0 ? (
                  <p className="text-text-secondary text-sm font-body">
                    Esta sesión no tiene ejercicios registrados.
                  </p>
                ) : (
                  exerciseGroups.map((group) => (
                    <div key={group.exercise?.id} className="bg-surface border border-surface-hover rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-hover">
                        <p className="font-display font-bold text-text-primary text-sm">
                          {group.exercise?.name}
                        </p>
                        <span className="text-xs text-text-secondary font-body capitalize">
                          {group.exercise?.muscle_group}
                        </span>
                      </div>
                      <div className="px-4">
                        <div className="grid py-2 text-xs text-text-secondary font-body border-b border-surface-hover"
                          style={{ gridTemplateColumns: '32px 1fr 80px 80px 44px', gap: '12px' }}>
                          <span>Serie</span>
                          <span></span>
                          <span className="text-center">Peso</span>
                          <span className="text-center">Reps</span>
                          <span className="text-center">✓</span>
                        </div>
                        {group.sets.map((se) => (
                          <SessionExerciseRow
                            key={se.id}
                            sessionExercise={se}
                            sessionId={selectedSession.id}
                            onUpdate={handleUpdateExercise}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showStartModal && (
        <StartSessionModal
          onClose={() => setShowStartModal(false)}
          onStart={handleStartSession}
        />
      )}
    </DashboardLayout>
  )
}

export default Sessions